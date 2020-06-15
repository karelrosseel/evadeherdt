
function makeScramble(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // SCRAMBLE
    // ~~~~~~~~~~~~~~~~~

    // This page features a Scrambler which can be used in matching games / questions
    // It lets the user drag things to order them after being scrambled
    // There is a "complete" event for when the tiles are in order
    // A key can be provided to the scrambler if there are multiple solutions
    // See https://zimjs.com/docs.html?item=Scrambler
    // and https://zimjs.com/cat/scrambler.html

    // We make heavy use of ZIM Tile() for layout in this example
    // Note the unique style is being applied to the Tile
    // which means that if we pass it an array then it does not clone them
    // Normal Tile is to tile one object and clone it
    // but the unique parameter was introduced in ZIM Cat
    // to make tiling unique items more intuitive

    var page = new Page(stageW, stageH, orange, green);
    page.quiz = "Scramble";

    STYLE = {
        unique:true,
        font:"reuben",
        size:30,
        variant:true,
        color:white,
        align:CENTER,
        backing:new Rectangle(180,50,purple).centerReg({add:false})
    };

    var answers = ["alligator.jpg", "elephant.jpg", "giraffe.jpg", "hippo.jpg"];
    new Tile({
        obj:answers,
        cols:4,
        spacingH:10,
        valign:BOTTOM
    }).sca(.8).ble("multiply").noMouse().center(page).mov(0,-40);

    var words = new Tile([
        new Label("Alligator"),
        new Label("Elephant"),
        new Label("Giraffe"),
        new Label("Hippo")
    ], 4, 1, 10, 0, true);
    // we need to reset the scrambler if we go to another page and come back
    // we store the scrambler on the page so the main quiz page can handle this
    var scrambler = page.scrambler = new Scrambler(words).centerReg().pos(40,160,CENTER,BOTTOM,page);

    var emitter = new Emitter({
        obj:new Rectangle(10, 10, [purple, pink, dark, white, purple]),
        random:{scale:{min:1, max:4}, rotation:{min:0, max:360}},
        horizontal:true,
        width:scrambler.width,
        force:{min:4, max:15},
        height:10,
        num:5,
        angle:{min:-90-20, max:-90+20},
        startPaused:true
    }).loc(scrambler, null, page).mov(0,-30);


    scrambler.on("complete", function () {
        // scrambler.enabled = false; // chose not to use as the page swipes
        emitter.spurt(200);
        asset("woohoo").play({interrupt:"any"});
        page.go.loc(765, 187, page).alp(0).animate({
            props:{alpha:1},
            wait:1
        });
        page.replay.loc(699, 141, page).alp(0).animate({
            props:{alpha:1},
            wait:1.5
        });
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
        // scrambler.enabled = true; // chose not to use as the page swipes
        page.go.animate({alpha:0}, .3);
        page.replay.animate({alpha:0}, .3);
        scrambler.scramble(1.5,.3, 3);
    })


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({color:green.darken(.7), size:40, align:LEFT});

    new Label("Move the words to the matching animal!")
        .pos(0,70,CENTER,TOP,page);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    page.readQuestion = function() {
        page.read = asset("scramble").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(20,80,LEFT,BOTTOM,page)
            .animate({props:{alpha:.8}, wait:.5})
            .animate({
                props:{x:"20", rotation:5},
                time:1,
                loopCount:2,
                wait:.7,
                loopWait:.5,
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

    var hand = asset("drag.jpg")
        .clone()
        .sca(.5)
        .reg(100,100)
        .ble("multiply")
        .alp(0);

    // var icon = stage.frame.makeIcon()
    //     .sca(.45)
    //     .centerReg(page)
    //     .pos(40,35, RIGHT, TOP)
    //     .tap(function () {
    //         zgo("https://zimjs.com", "_blank");
    //     });
    // new Label({font:"verdana", size:16, text:page.quiz.toUpperCase()}).centerReg(page).loc(icon).mov(0,45).alp(.8);

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
