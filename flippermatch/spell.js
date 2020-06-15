
function makeSpell(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // SPELL
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

    var page = new Page(stageW, stageH, yellow, green);
    page.quiz = "Spell";

    STYLE = {
        unique:true,
        font:"reuben",
        size:30,
        variant:true,
        color:white,
        align:CENTER,
        backing:new Rectangle(180,50,purple).centerReg({add:false})
    };

    var answers = ["horse.jpg", "sheep.jpg", "pig.jpg", "rooster.jpg"];
    var index = 0;

    var pic;
    var scrambler;
    var emitter;
    var playCheck = true;

    function makeAnswer() {

        var answer = answers[index];
        pic = asset(answer).pos(0,stageH/2-130+60,CENTER,BOTTOM,page).ble("multiply");
        currentLetters = answer.split(".")[0].split("");
        var tiles = [];
        zim.loop(currentLetters, function (letter, i) {
            var tile = new zim.Label({
                text:letter,
                color:pink.lighten(.9),
                size:50,
                backing:new zim.Rectangle(65,75,purple),
                align:CENTER,
                valign:CENTER,
            });
            tiles.push(tile);
        });

        var tile = new Tile({
            obj:tiles,
            unique:true,
            cols:tiles.length,
            spacingH:15
        });

        scrambler = page.scrambler = new Scrambler(tile, currentLetters, "text")
            .centerReg().pos(0,stageH/2+130,CENTER,TOP,page);

        scrambler.on("mousedown", function () {
            if (page.go.alpha > 0) {
                page.replay.animate({alpha:0}, .4);
                page.go.animate({alpha:0}, .4);
            }
        })

        emitter = new Emitter({
            obj:new Rectangle(10, 10, [purple, pink, dark, white, purple]),
            random:{scale:{min:1, max:4}, rotation:{min:0, max:360}},
            horizontal:true,
            width:scrambler.width,
            force:{min:4, max:15},
            height:10,
            num:5,
            angle:{min:-90-20, max:-90+20},
            startPaused:true
        }).loc(scrambler, null, page).mov(0,-40);

        scrambler.on("complete", function () {
            if (!playCheck) return;
            playCheck = false;
            // tell main script to stop pages from being swiped
            page.dispatchEvent("freezeon");

            emitter.spurt(100);
            asset("woohoo").play({interrupt:"any"});
            index++;
            timeout(2, function () {
                if (index >= answers.length) {
                    page.go.loc(765, 207, page).alp(0).animate({
                        props:{alpha:1},
                        wait:1
                    });
                    page.replay.loc(699, 161, page).alp(0).animate({
                        props:{alpha:1},
                        wait:1.5
                    });
                    index = 0;
                    nextAnswer(true); // quiet
                } else {
                    nextAnswer();
                }
            });
        });

    }
    makeAnswer();

    function nextAnswer(quiet) {
        scrambler.animate({alpha:0}, .4);
        pic.animate({alpha:0}, .4, null, function () {
            emitter.dispose();
            // scrambler.dispose();
            makeAnswer();
            if (!quiet) page.read = asset("spell").play();
            pic.alp(0).animate({alpha:1}, .5);
            scrambler.alp(0).animate({alpha:1}, .5, null, function () {
                page.dispatchEvent("freezeoff"); // let the pages be changed again
            });
            playCheck = true;
        });
    }
    page.nextAnswer = nextAnswer;

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
    })


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({color:green.darken(.7), size:40, align:LEFT});

    new Label("Move letters to spell animal name!")
        .pos(0,70,CENTER,TOP,page);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    page.readQuestion = function() {
        page.read = asset("spell").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(350,45,LEFT,BOTTOM,page)
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
