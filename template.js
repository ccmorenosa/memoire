class TitleSlide extends HTMLElement {
    constructor() {
        super();

        this.classList.add(
            "flex", "flex-col", "w-full", "h-full", "text-dunkelblau");
        const title = document.createElement("p");
        title.classList.add(
            "my-16", "border-b-10", "border-rot", "text-9xl", "font-bold"
        );
        title.innerText = this.getAttribute("title");

        const subtitle = document.createElement("p");
        subtitle.classList.add("text-7xl", "font-bold");
        const subtitleText = document.createElement("div");
        subtitleText.innerText = this.getAttribute("subtitle");

        subtitle.appendChild(subtitleText);

        this.appendChild(title);
        this.appendChild(subtitle);

        const contents = document.createElement("div");
        contents.classList.add("flex", "flex-row", "w-full", "h-full")

        // Info column
        const div_info = document.createElement("div");
        div_info.classList.add(
            "flex-3/4", "flex", "flex-col", "font-bold",
            "text-5xl"
        );
        const area = document.createElement("p");
        area.innerText = this.getAttribute("area");
        div_info.appendChild(area);

        const author = document.createElement("div");
        author.classList.add("mt-auto");
        const name = document.createElement("p");
        name.classList.add("mb-2", "text-8xl");
        name.innerText = this.getAttribute("name");
        author.appendChild(name);
        if (this.hasAttribute("place") || this.hasAttribute("date")) {
            const datePlace = document.createElement("p");
            datePlace.classList.add("mb-0");
            if (this.hasAttribute("place") && this.hasAttribute("date")) {
                datePlace.innerText = (
                    `${this.getAttribute("place")}, `
                    `${this.getAttribute("date")}`
                );
            } else if (this.getAttribute("place")) {
                datePlace.innerText = this.getAttribute("place");
            } else {
                datePlace.innerText = this.getAttribute("date");
            }

            author.appendChild(datePlace);
        }

        div_info.appendChild(author);


        const div_left_col = document.createElement("div");
        div_left_col.classList.add("mt-5", "flex");

        const Quanteem_logo = document.createElement("div");
        Quanteem_logo.classList.add("mr-10");
        const Quanteem_image = document.createElement("img");
        Quanteem_image.src = "../public/Logo_Quanteem.svg";
        Quanteem_image.setAttribute("width", 400);
        Quanteem_image.setAttribute("height", 400);
        Quanteem_logo.appendChild(Quanteem_image);

        const UBE_logo = document.createElement("div");
        UBE_logo.classList.add("mr-10");
        const UBE_image = document.createElement("img");
        UBE_image.src = "../public/Logo_UBE.svg";
        UBE_image.setAttribute("width", 270);
        UBE_image.setAttribute("height", 270);
        UBE_image.classList.add("ml-10");
        UBE_logo.appendChild(UBE_image);

        const Neel_logo = document.createElement("div");
        Neel_logo.classList.add("mr-10");
        const Neel_image = document.createElement("img");
        Neel_image.src = "../public/Neel_Q.svg";
        Neel_image.setAttribute("width", 313);
        Neel_image.setAttribute("height", 313);
        Neel_image.classList.add("ml-10");
        Neel_logo.appendChild(Neel_image);

        const CNRS_logo = document.createElement("div");
        CNRS_logo.classList.add("mr-10");
        const CNRS_image = document.createElement("img");
        CNRS_image.src = "../public/CNRS.svg";
        CNRS_image.setAttribute("width", 168);
        CNRS_image.setAttribute("height", 168);
        CNRS_image.classList.add("ml-10");
        CNRS_logo.appendChild(CNRS_image);

        div_left_col.appendChild(Quanteem_logo);
        div_left_col.appendChild(UBE_logo);
        div_left_col.appendChild(Neel_logo);
        div_left_col.appendChild(CNRS_logo);

        div_info.appendChild(div_left_col);

        // Middle Space.
        // const div_mid = document.createElement("div");
        // div_mid.classList.add("flex-1/8", "flex");

        // Logo.
        const div_right_col = document.createElement("div");
        div_right_col.classList.add("flex-1/4", "flex", "flex-col");

        const div_logos = document.createElement("div");
        div_logos.classList.add("mt-5", "flex");

        // const neel_logo = document.createElement("div");
        // neel_logo.classList.add("mr-10");
        // const neel_image = document.createElement("img");
        // neel_image.src = "../public/Neel.png";
        // neel_image.setAttribute("width", 330);
        // neel_image.setAttribute("height", 115);
        // neel_logo.appendChild(neel_image);

        // const cnrs_logo = document.createElement("div");
        // // cnrs_logo.classList.add("ml-10");
        // const cnrs_image = document.createElement("img");
        // cnrs_image.src = "../public/CNRS.svg";
        // cnrs_image.setAttribute("width", 170);
        // cnrs_image.setAttribute("height", 170);
        // cnrs_image.classList.add("ml-10");
        // cnrs_logo.appendChild(cnrs_image);

        // div_logos.appendChild(neel_logo);
        // div_logos.appendChild(cnrs_logo);

        if (this.getAttribute("directors") !== null) {
            let directors = this.getAttribute("directors").split(",");
            let directors_title;

            if (directors.length > 1) {
                directors_title = "Thesis directors";
            } else {
                directors_title = "Thesis director";
            }

            const div_director = document.createElement("div");
            div_director.classList.add("mt-auto", "text-6xl");
            div_director.innerText = (
                `${directors_title}:
                ${directors.join("\n")}`
            );

            div_right_col.appendChild(div_director);
        }

        div_right_col.appendChild(div_logos);

        // All.
        contents.appendChild(div_info);
        // contents.appendChild(div_mid);
        contents.appendChild(div_right_col);
        this.appendChild(contents);

    }
}

class TopBar extends HTMLElement{
    static observedAttributes = ["slide-count"];

    constructor() {
        super();

        if (this.hasAttribute("Build")) {
            return;
        }

        this.setAttribute("Build", true);

        this.classList.add("flex", "w-full", "flex-row");

        var atomCount = 0;

        const actualAtom = this.getAttribute("atom-count");

        for (const sect in sections) {

            const div_block = document.createElement("div");
            div_block.classList.add(
                "flex-1", "flex", "flex-col", "text-center"
            );

            const span_text = document.createElement("span");
            span_text.classList.add("m-0");

            span_text.innerHTML = sect;
            div_block.appendChild(span_text);

            const div_atoms = document.createElement("div");
            div_atoms.classList.add("flex", "flex-row", "justify-center");

            if (Object.prototype.hasOwnProperty.call(sections, sect)) {
                for (let subSect = 0; subSect < sections[sect]; subSect++) {
                    atomCount++;

                    const atom_a = document.createElement("a");
                    const atom_img = document.createElement("img");
                    if (atomCount == Number(actualAtom)) {
                        atom_img.src = "../public/atom_active.svg";
                    } else {
                        atom_img.src = "../public/atom.svg";
                    }
                    atom_img.width = "30";
                    atom_img.style.marginRight = "0";
                    atom_img.style.margin = "10px";

                    atom_a.appendChild(atom_img);
                    atom_a.href = `#${atomCount}`
                    div_atoms.appendChild(atom_a);

                }
            }

            div_block.appendChild(div_atoms);
            this.appendChild(div_block);
        }
    }
}

class SlideBody extends HTMLElement{
    constructor() {
        super();

        if (this.hasAttribute("Build")) {
            return;
        }

        this.setAttribute("Build", true);

        this.classList.add("flex", "flex-col", "h-full", "text-5xl");

        const div_title = document.createElement("div");
        div_title.classList.add(
            "mb-5", "pb-5", "border-b-10", "border-rot", "text-5xl"
        );
        div_title.innerHTML = `<h2>${this.getAttribute("title")}</h2>`;

        this.insertBefore(div_title, this.firstChild);

    }
}

customElements.define("title-slide", TitleSlide);
customElements.define("top-bar", TopBar);
customElements.define("slide-body", SlideBody);
