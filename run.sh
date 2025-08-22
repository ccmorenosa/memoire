#! /usr/bin/zsh

CheckNode () {
    NODE_VERSION="20.0.0"

    if command -v nvm node >/dev/null 2>&1; then
        echo "Node found"

        INSTALLED_VERSION=$(node -v | sed 's/v//')

        if [ "$INSTALLED_VERSION" == "$NODE_VERSION" ];then
            return
        else
            echo "node version is $INSTALLED_VERSION and the slides run on $NODE_VERSION"
            echo "installing node v$NODE_VERSION"

            nvm install "$NODE_VERSION"
            nvm alias default "$NODE_VERSION"
            nvm use
        fi

    else
        echo "Node do not found, installing..."
        # Download and install nvm:
        wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

        # Download and install Node.js:
        nvm install "$NODE_VERSION"
        nvm alias default "$NODE_VERSION"
        nvm use
    fi
}

EmptyDir () {
    if [ ! -z "$( ls -A $1 )" ]; then
        rm -r $1/*
    fi
}

DelFile () {
    if [ -f $1 ]; then
        rm $1
    fi
}

InstallPackages () {
    I_DEST=$1
    I_SOURCE=$2

    DelFile $I_DEST/package.json
    DelFile $I_DEST/gulpfile.js

    cp -f $I_SOURCE/package.json $I_SOURCE/gulpfile.js $I_DEST

    cd $I_DEST

    if [ ! -d reveal.js ]; then
        git clone https://github.com/hakimel/reveal.js.git
    else
        cd reveal.js
        git pull
        cd -
    fi

    npm i
    cd -
}

Update () {
    U_DEST=$1
    U_SOURCE=$2

    EmptyDir $U_DEST/scripts/
    EmptyDir $U_DEST/public/
    EmptyDir $U_DEST/style/
    DelFile $U_DEST/tailwind.config.js
    DelFile $U_DEST/presentations/**/index.html

    cp $U_SOURCE/scripts/tailwind.config.js $U_DEST/

    cp -r -f $U_SOURCE/scripts/*.js $U_DEST/scripts/

    cp -rf $U_SOURCE/public/* $U_DEST/public/

    rm -rf $U_DEST/presentations/commonjs $U_DEST/presentations/esm
    cp -r -f $U_SOURCE/presentations/* $U_DEST/presentations

    cp -r -f $U_SOURCE/style/* $U_DEST/style/

    cd $U_DEST
    npm run diapo
    cd -

    # cp -f $U_DEST/public/* $U_DEST/dist/presentations/public/
}

BuildRemote () {
    BUILD=$1
    B_DEST=$2
    B_SOURCE=$3
    B_INSTALL=$4
    B_UPDATE=$5

    if [ ! -d $B_DEST/output_remote ]; then

        if [ ! -d $BUILD ]; then
            mkdir $BUILD
        fi

        cd $BUILD

        # Download and unzip plugin.
        # https://github.com/cologneintelligence/reveal.js-remote
        wget https://github.com/cologneintelligence/reveal.js-remote/archive/refs/heads/master.zip
        unzip master.zip -d $B_DEST
        rm master.zip

        mv $B_DEST/reveal.js-remote-master/ $B_DEST/output_remote/
        B_DEST=$B_DEST/output_remote
        mkdir $B_DEST/scripts/ $B_DEST/public/ $B_DEST/style/

        cp -r -f $B_SOURCE/plugin/* $B_DEST/plugin/

        rm -rf node_modules $B_DEST/presentations/reveal.js

        cd -
        rm -rf $1

        InstallPackages $B_DEST $B_SOURCE
        Update $B_DEST $B_SOURCE

    else
        B_DEST=$B_DEST/output_remote

        if $B_INSTALL; then
            InstallPackages $B_DEST $B_SOURCE
        fi

        if $B_UPDATE; then
            Update $B_DEST $B_SOURCE
        fi

    fi

    cd $B_DEST
    npm run remote
    cd -

}

BuildDefault () {
    B_DEST=$1
    B_SOURCE=$2
    B_INSTALL=$3
    B_UPDATE=$4

    if [ ! -d $B_DEST/output ]; then

        mkdir $B_DEST/output
        B_DEST=$B_DEST/output
        mkdir $B_DEST/scripts/ $B_DEST/public/ $B_DEST/style/
        mkdir $B_DEST/presentations $B_DEST/plugin/

        cp -r -f $B_SOURCE/plugin/* $B_DEST/plugin/

        cd $B_DEST

        InstallPackages $B_DEST $B_SOURCE
        Update $B_DEST $B_SOURCE

        mkdir $B_DEST/dist/presentations/plugin

        EmptyDir $B_DEST/dist/presentations/plugin/
        cp -r -f $B_SOURCE/plugin/* $B_DEST/dist/presentations/plugin/

    else
        B_DEST=$B_DEST/output

        if $B_INSTALL; then
            InstallPackages $B_DEST $B_SOURCE
            EmptyDir $B_DEST/dist/presentations/plugin/
            cp -r -f $B_SOURCE/plugin/* $B_DEST/dist/presentations/plugin/
        fi

        if $B_UPDATE; then
            Update $B_DEST $B_SOURCE
        fi

    fi

    cd $B_DEST
    npm run build
    cd -

}

Help()
{
    # Display Help
    echo "Run file to build, configure and present slides."
    echo
    echo "Syntax: source slides.sh [-h|i|l|n|r] [--source SRC]"
    echo "                         [--build BUILD] [--dest DEST]"
    echo "options:"
    echo "-h, --help            Print this Help."
    echo "-b, --build [BUILD]   Set the build directory."
    echo "-d, --dest [DEST]     Set the destination directory."
    echo "-g, --gh-pages        Deploy to github pages."
    echo "-i, --install         Install the needed package for the slides."
    echo "-l, --loop            Make a loop to constant update and refresh the"
    echo "                      slides."
    echo "-n, --no-update       Skip the update process of the configuration,"
    echo "                      slides and statics."
    echo "-r, --remote          Run with the remote configuration."
    echo "-s, --source [SRC]    Set the source directory."
    echo
}

CheckNode


ARGS=$(getopt -o hgilnrb:s:d:\
    --long help,gh-pages,install,loop,no-update,remote,build:,source:,dest: \
    -- "$@")

if [ $? != 0 ] ; then echo "Terminating..." >&2 ; return ; fi

# Note the quotes around '$ARGS': they are essential!
eval set -- "$ARGS"

ORIGIN=$(pwd)
PAGES=false
REMOTE=false
INSTALL=false
UPDATE=true
LOOP=false
DEST=$ORIGIN
SOURCE=$ORIGIN/src
BUILD=$ORIGIN/build
while true; do
    case "$1" in
        -h|--help)
            Help; return ;;
        -d|--dest)
            DEST="$2"; shift 2 ;;
        -b|--build)
            BUILD="$2"; shift 2 ;;
        -g|--gh-pages)
            PAGES=true; shift ;;
        -i|--install)
            INSTALL=true; shift ;;
        -l|--loop)
            LOOP=true; shift ;;
        -n|--no-update)
            UPDATE=false; shift ;;
        -r|--remote)
            REMOTE=true; shift ;;
        -s|--source)
            SOURCE="$2"; shift 2 ;;
        -- ) shift; break ;;
        *) break;;
    esac
done

if [ ! -d $DEST ]; then
    mkdir $DEST
fi


if $PAGES; then

    echo $PAGES
    BuildRemote $BUILD $DEST $SOURCE true true

    DEST=$DEST/output_remote
    cd $DEST

    rm $DEST/dist/presentations/main.js
    mv $DEST/scripts/main_remote.js $DEST/dist/presentations/main.js

    npm run deploy
    cd $ORIGIN

elif $REMOTE; then

    BuildRemote $BUILD $DEST $SOURCE $INSTALL $UPDATE

    cd $ORIGIN

    DEST=$DEST/output_remote

    if $LOOP; then
        while true; do
            rm $DEST/dist/presentations/main.js
            mv $DEST/scripts/main_remote.js $DEST/dist/presentations/main.js
            node $DEST/dist/index
            Update $DEST $SOURCE
        done
    else
        rm $DEST/dist/presentations/main.js
        mv $DEST/scripts/main_remote.js $DEST/dist/presentations/main.js
        node $DEST/dist/index
    fi

else

    BuildDefault $DEST $SOURCE $INSTALL $UPDATE

    DEST=$DEST/output

    cd $DEST

    rm -rf $DEST/dist/presentations/plugin/
    cp -r $DEST/dist/static/plugin/ $DEST/dist/presentations/
    npm run start

    cd $ORIGIN

fi
