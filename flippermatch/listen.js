
function makeListen(stage) {
    var stageW = stageW;
    var stageH = stageH;

    // ~~~~~~~~~~~~~~~~~
    // LISTEN
    // ~~~~~~~~~~~~~~~~~

    // Here we work with sounds, matching and animation
    // We deal with data for multiple sets of "questions" on one page
    // You can see that the code can add up to keep track of all the little parts
    // but it is all the same ZIM things we use all the time
    // A fair bit of thought needs to go into what happens at the start and end
    // and stopping sounds if desired when other sounds play

    var page = new Page(stageW, stageH, blue, yellow);
    page.quiz = "Listen";

    STYLE = {}; // clear style from previous pages - or use Style.clear();

    // Instead of tiling pictures we tile Containers to hold the pictures
    // This way, we can replace the pictures in the containers
    // rather than the whole tile each set
    var pics = page.pics = new Tile({
        obj:new Container(200,200).centerReg({add:false}),
        cols:2,
        rows:2,
        spacingH:200,
        spacingV:150,
        valign:CENTER
    })
        .sca(1)
        .ble("multiply")
        .center(page)
        .mov(0,50);

    // Here are the sets of pictures and sounds
    // we could have used the common words - dragonfly, etc.
    // to reduce the code - but we have left the filenames in full
    // just in case your filenames are different
    // note: the order for the two match
    var picSets = [
        ["dragonfly.jpg", "butterfly.jpg", "ladybug.jpg", "spider.jpg"],
        ["owl.jpg", "bird.jpg", "penguin.jpg", "peacock.jpg"],
        ["dolphin.jpg", "whale.jpg", "fish.jpg", "shark.jpg"]
    ];
    var soundSets = [
        ["dragonfly.mp3", "butterfly.mp3", "ladybug.mp3", "spider.mp3"],
        ["owl.mp3", "bird.mp3", "penguin.mp3", "peacock.mp3"],
        ["dolphin.mp3", "whale.mp3", "fish.mp3", "shark.mp3"]
    ];

    // use currentSet to keep track of what set pictures we show and sounds we play
    // currentSound will be used to keep track of which sound we are on
    // The set variables will hold the current pics and sounds
    // sounds will hold a shuffled set of sounds to play
    var currentSet = 0;
    var currentSound = 0;
    var picSet;
    var soundSet;
    var sounds;

    // make a function to show pictures, etc. as we will do this multiple times
    function showPictures() {
        picSet = picSets[currentSet];
        soundSet = soundSets[currentSet];
        currentSound = 0;

        // make a copy of the sounds and shuffle them
        sounds = shuffle(copy(soundSet));

        // pics is the tile of containers. We will now put pics in them
        // and add the matching sound as a property of the pic.
        // This technique can be used in many places where a selected object has an answer
        // JavaScript is dynamic - meaning we can add our own properties to any object
        pics.loop(function (pic, i) {
            // pic is the container in the tile
            // remove any existing asset from pic
            // there would be at most one image so pic.getChildAt(0).remove()
            // would work... but removeAllChildren() is easier to write!
            pic.removeAllChildren();
            asset(picSet[i])
                .clone() // usually good to clone an image in case another copy is needed
                .center(pic);
            pic.cur().expand(); // make it easy for kids to press

            // warning, expand also acts like setting mouseChildren to false
            // so put answer property on pic (the Container) not on the inside asset
            // note - do not chain properties
            pic.answer = soundSet[i];
        });
    }
    showPictures();

    var playCheck = false; // we don't want to test animals unless a sound has been played

    var play = page.play = new Button({
        backgroundColor:purple,
        rollBackgroundColor:orange,
        width:120,
        height:120,
        corner:60,
        icon:pizzazz.makeIcon("play", white, 1.5)
    })
        .centerReg(page)
        .mov(0,30)
        .tap(function () {
            playCheck = true;
            // sounds is our shuffled sound list
            // do not increase currentSound here
            // but rather only if they get the sound right
            asset(sounds[currentSound]).play();
            if (page.read) page.read.stop();
        });

    // prepare the emitter to act as a reward
    // set the emitter to startPaused true and then spurt() when we want to!
    var emitter = new Emitter({
        obj:new Poly([10,20,30], 5, .6, [pink, purple, dark, purple]),
        num:5,
        gravity:0,
        force:{min:3, max:5},
        startPaused:true
    }).addTo(page).bot().ord(1); // put under the animals but above the page backing

    pics.on("mousedown", function (e) {
        // test to make sure a sound has been played
        if (!playCheck) {
            page.read = asset("listen").play();
            return; // do not go any further in the function
        }
        var pic = e.target; // e.target is what is clicked on in the pics tile (or a container)

        // test to see if the pic answer matches the current sound file
        if (pic.answer == sounds[currentSound]) {
            playCheck = false; // will need to play the new sound before picking an animal again
            asset("woohoo").play({interrupt:"any"}); // play instead of an older woohoo

            emitter.loc(pic, null, page).spurt(100);
            currentSound++; // go to the next sound
            // if finished this set go to the next set
            if (currentSound >= soundSet.length) {
                gotoNextSet();
            }
        } else {
            // interrupt "any" stops the previous playing of the same sound
            // but only if the sound has a maxNum set when loading the asset
            // if there is a maxNum set and no interrupt then the default is "none"
            // which would mean the original sound would keep playing and not be interrupted
            asset("tryagain").play({interrupt:"any"});
            // shake the pic to show it is wrong
            pic.animate({
                props:{scale:1.5},
                loopCount:2,
                time:.2,
                rewind:true
            });
        }
    }); // end mousedown on pic

    function gotoNextSet() {
        currentSet++;
        // turn off the play button which changing sets
        play.enabled = false;
        play.animate({
            props:{scale:0, alpha:0},
            time:1,
            ease:"backIn"
        });
        // animate out the current pics tile
        // when faded out swap the set with new pics
        // then animate back in the pics tile
        pics.animate({
            props:{alpha:0},
            wait:2,
            time:1,
            rewind:true,
            rewindCall:function () {
                if (currentSet >= soundSets.length) { // at end of all sets
                    play.pauseAnimate();
                    currentSet = 0;
                    currentSound = 0;
                    page.go.center(page).mov(0,30).alp(0).animate({alpha:1});
                    page.replay.loc(page.go, null, page).mov(-66,-16).alp(0).animate({alpha:1});
                } else {
                    page.read = asset("listen").play();
                    play.animate({
                        props:{scale:1, alpha:1},
                        time:1,
                        ease:"backOut"
                    });
                }
                showPictures();
            },
            call:function () {
                // turn back on the play button when animating is done
                play.enabled = true;
            }
        });
    }


    // ~~~~~~~~~~~~~~~~~~
    // GO AND REPLAY
    // these are animated in above when needed

    Style.remove("backing");
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
        page.go.animate({alpha:0}, .3);
        page.replay.animate({alpha:0}, .3);
        page.read = asset("listen").play();
        play.animate({
            props:{scale:1, alpha:1},
            time:1,
            ease:"backOut"
        });
    });



    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({font:"reuben", size:40, variant:true, color:green.darken(.7), align:LEFT});

    new Label("Play the sound and press the matching animal!")
        .pos(0,70,CENTER,TOP,page);


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    var wiggleCheck = false; // have not started animating
    page.readQuestion = function() {
        pics.loop(function (pic) {
            if (!wiggleCheck) {
                pic
                    .wiggle("x", pic.x, 5,30, 5,8)
                    .wiggle("y", pic.y, 5,10, 5,8)
                    // .wiggle("rotation", pic.rotation, 1,5,5,10);
            } else {
                pic.pauseAnimate(false);
            }
        });
        wiggleCheck = true;
        page.read = asset("listen").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(0,170,CENTER,CENTER,page)
            .animate({props:{alpha:.8}, wait:.5})
            .animate({
                props:{y:"-20"},
                time:1,
                loopCount:2,
                wait:.7,
                loopWait:.2,
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
        font:"reuben",
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
        .rot(-10)
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

}
