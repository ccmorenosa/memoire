import Reveal from '/reveal.esm.js';
import Markdown from '/_remote/plugin/markdown/markdown.esm.js';
import KateX from '/_remote/plugin/math/math.esm.js';
import RevealNotes from '/_remote/plugin/notes/notes.esm.js'
import RevealRemote from '/_remote/plugin/remote.esm.js';

let deck = new Reveal({

    width: 3840/1.7,
    height: 2160/1.7,
    minScale: 0.5,
    maxScale: 1,

    top:0,

    slideNumber: true,

    autoPlayMedia: true,

    plugins: [Markdown, KateX, RevealNotes, RevealRemote],

    remote: {
        // enable remote control
        remote: true,

        // enable multiplexing
        multiplex: true,

        // server address
        // change this if you do not serve the presentation from the same domain
        // example: https://presentations.jowisoftware.de
        server: window.location.protocol + "//" + window.location.host,

        // path to socket.io
        // change this if the base path of the server is not "/"
        path: "/socket.io",

        // url of the presentation to share
        shareUrl: window.location.href
    },

    dependencies: [
        // { src: 'http://localhost:3000/socket.io/socket.io.js', async: true },
        // { src: 'plugins/remote/plugin/remote.js', async: true },
    ]

});

deck.initialize();
