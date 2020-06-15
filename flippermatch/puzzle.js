
function makePuzzle(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // PUZZLE
    // ~~~~~~~~~~~~~~~~~

    // Here we use the Scrambler again but in grid form to make a puzzle
    // This is quite a nice way to do a puzzle
    // it is not the kind where there is one square missing
    // and you can only slide things into that square
    // That could be coded in ZIM - but this is not that.
    // However, it makes for an easier experience, perfect for kids
    // and even somewhat satisfying for adults.
    // We tried with 4000 squares... yikes!

    var page = new Page(stageW, stageH, yellow, orange);
    page.quiz = "Puzzle";

    STYLE = {
        unique:true,
        font:"reuben",
        size:30,
        variant:true,
        color:white,
        align:CENTER,
    };


    var thumbs = [];
    var cols = 3;
    var rows = 3;

    // copy the pic for each square and show the right part of the main bitmap
    // neat technique - and beats cutting up a real image
    var pic = page.pic = asset("puzzle.jpg");
    var w = pic.width/cols;
    var h = pic.height/rows;
    loop(rows, function (r) {
        loop(cols, function (c) {
            thumbs.push(new Bitmap(pic, w, h, c*w, r*h));
        });
    });

    // ZIM Cat
    // Tile now has a unique parameter inserted after the spacings
    // this will use an array as its first parameter and not clone objects
    // Do not use unique to use ZIM VEE as first object for instance an array for random entries
    // This makes it easier to create a tiled series
    var tile = new Tile(thumbs, cols, rows, 0, 0, true);

    // ZIM Cat
    // new Scrambler() class to scramble a Tile
    // the tile should have consistent column widths and row heights
    // althought width and height can be different from one another
    // the Scrambler works very well for e-learning apps and matching puzzles
    // works with horizontal or vertical or grid arrangements
    var scrambler = page.scrambler = new Scrambler(tile)
        .sca(.8)
        .centerReg(page)
        .mov(0,50);

    scrambler.on("complete", function () {
        asset("woohoo.mp3").play();
        pic
            .centerReg(page)
            .sca(.8)
            .loc(scrambler)
            .rot(0) // in case playing it again!
            .animate({
                props:{rotation:720},
                time:2,
                ease:"backInOut",
                call:function () {
                    pic.bot().ord(1);
                    page.go.loc(690, 217, page).alp(0).animate({
                        props:{alpha:1},
                        wait:1
                    });
                    page.replay.loc(800, 155, page).alp(0).animate({
                        props:{alpha:1},
                        wait:1.5
                    });
                }
            })
        scrambler.alp(0);
        stage.update();
    });



    // ~~~~~~~~~~~~~~~~~~
    // GO AND REPLAY
    // these are animated in above when needed

    Style.remove("backing"); // otherwise it puts backings on these objects
    Style.add({size:50});

    page.go = new Button({
        width:140,
        height:140,
        backgroundColor:purple,
        rollBackgroundColor:blue,
        label:"GO",
        corner:70
    });

    page.replay = new Button({
        width:60,
        height:60,
        backgroundColor:green,
        rollBackgroundColor:blue,
        icon:pizzazz.makeIcon("rotate", white, .9),
        label:"",
        corner:30
    }).tap(function () {
        asset("puzzle").play();
        scrambler.alp(1).scramble(2,0,3);
        page.go.animate({alpha:0}, .2);
        page.replay.animate({alpha:0}, .2);
        pic.removeFrom();
    })


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({color:green.darken(.7), size:40, align:LEFT});

    new Label("Unscramble the picture!")
        .pos(0,70,CENTER,TOP,page);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    page.readQuestion = function() {
        page.read = asset("puzzle").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(100,200,LEFT,BOTTOM,page)
            .animate({props:{alpha:.8}, wait:.5})
            .animate({
                props:{y:series("-150","-100"), x:series("40","-40")},
                time:.7,
                loopCount:2,
                wait:.5,
                loopWait:.5,
                rewindWait:.5,
                loopPick:true,
                rewind:true,
                call:function () {
                    hand.animate({
                        props:{alpha:0},
                        call:function () {
                            hand.removeFrom();
                            help.animate({scale:1}, .4, "backOut")
                        }
                    });
                }
            });
    }

    var help = new Label({
        backing:new Circle(30, green.darken(.6)),
        align:CENTER,
        valign:CENTER,
        size:60,
        color:green,
        shiftVertical:1,
        shiftHorizontal:1,
        text:"?"
    }).pos(60,60,LEFT,BOTTOM,page)
        .expand() // make it easier to press on mobile especially for kids
        .cur() // show a cursor if not on mobile
        .sca(0) // start with the help not seen - we will animate it in
        .tap(page.readQuestion); // call

    var hand = asset("press.jpg")
        .clone()
        .sca(.5)
        .rot(70)
        .ble("multiply")
        .alp(0);

    var icon = stage.frame.makeIcon()
        .sca(.45)
        .centerReg(page)
        .pos(60,60, RIGHT, BOTTOM)
        .tap(function () {
            zgo("https://zimjs.com", "_blank");
        });
    new Label({font:"verdana", size:16, text:page.quiz.toUpperCase()}).centerReg(page).loc(icon).mov(0,45).alp(.8);



    return page; // so main script has access to this page and its properties
};
