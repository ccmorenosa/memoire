import Reveal from '/reveal.esm.js';
import Markdown from '/plugin/markdown/markdown.esm.js';
import MathJax3 from '/plugin/math/math.esm.js';
import RevealNotes from '/plugin/notes/notes.esm.js'

let deck = new Reveal({

    // controls: true,
    // progress: true,
    // center: true,
    // hash: true,

    width: 3840 / 1.5,
    height: 2160 / 1.5,
    margin: 0.04,
    minScale: 0.5,
    maxScale: 1,

    top:0,

    slideNumber: true,

    pdfMaxPagesPerSlide: 1,

    autoPlayMedia: true,

    plugins: [Markdown, MathJax3, RevealNotes],

    dependencies: [
        // { src: 'http://localhost:3000/socket.io/socket.io.js', async: true },
        // { src: 'plugins/remote/plugin/remote.js', async: true },
    ]

});

deck.initialize();
