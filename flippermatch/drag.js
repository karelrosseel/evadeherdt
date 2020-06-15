
function makeDrag(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // DRAG
    // ~~~~~~~~~~~~~~~~~

    // Here we drag items to other items
    // and keep track of the answers on the items
    // This is easier if the items are the same size
    // then we would snap to the registration points
    // but here we want certain spots
    // We did include more general code as well.
    // We also play with scale as we drag - for a 3D effect

    var page = new Page(stageW, stageH, orange, green);
    page.quiz = "Drag";

    STYLE = {
        unique:true,
        font:"reuben",
        size:30,
        variant:true,
        color:white,
        align:CENTER
    };

    // turn strings into array of Bitmap objects
    var draggers = ["rabbit.jpg", "kuala.jpg", "duck.jpg"];
    var spots = [{x:7, y:-93}, {x:345, y:-197}, {x:566, y:-161}]; // worked these out with .place()
    loop(draggers, function (d, i) {
        draggers[i] = asset(d).clone().centerReg({add:false}); // .place();
        draggers[i].spot = spots[i];
    });

    // turn strings into array of Bitmap objects
    var homers = ["field.png", "tree.png", "water.png"];

    loop(homers, function (h, i) {
        homers[i] = asset(h).clone().centerReg({add:false});

        draggers[i].answer = homers[i]; // add the matching answer to what you are dragging
    });

    // // A. this is a test to make sure that the shuffled order is not the same
    // var answer = true;
    // var num = 0;
    // while(answer && num<50) {
    //     shuffle(draggers); // or just shuffle one or the other
    //     shuffle(homers);
    //     answer = loop(draggers, function (d, i) {
    //         if (d.answer != homers[i]) return false; // in different order
    //     });
    //     num++;
    // }

    // // B. this tests to make sure that each pair is different
    // var different = false;
    // var num = 0;
    // while(!different && num<50) {
    //     shuffle(draggers); // or just shuffle one or the other
    //     // shuffle(homers);
    //     var different = loop(draggers, function (d, i) {
    //         if (d.answer == homers[i]) return false; // in same order
    //     });
    //     num++;
    // }

    // C. could just set the order of one or the other or both
    // which is what we do this time - we are making some scale and position changes
    // and the randomizing is not particularily important
    // if we wanted to, we could just adjust the images to be treated the same when randomized
    draggers = [draggers[1], draggers[2], draggers[0]];


    // NOTE: unique is set to true in STYLE so Tile expects an array
    // and will make an array with these objects without cloning them

    var drag = new Tile({
        obj:draggers,
        cols:4,
        valign:BOTTOM,
        spacingH:80
    }).ble("multiply").centerReg(page).mov(30,200);
    // just adjusting the duck...
    drag.getChildAt(1).sca(1.3).mov(0,-14);
    drag.loop(function (d) {
        d.startX = d.x;
        d.startY = d.y;
        d.startScale = d.scale;
        d.on("animation", function () {
            d.sca(d.startScale*proportion.convert(d.startY-d.y));
        })
    });
    drag.drag(new Boundary(100,200,stageW-200,stageH-350));

    var home = new Tile({
        obj:homers,
        cols:4,
        valign:BOTTOM,
        spacingH:40
    }).ble("multiply").centerReg(page).mov(0,-120);
    // just adjusting the field and tree
    home.getChildAt(0).sca(1.1).mov(40,16)
    home.getChildAt(1).mov(0,24)

    // make the dragging object get smaller as it is up higher
    // this has a neat feeling of depth but also scales the object for its environment
    var proportion = new Proportion(0, drag.y-home.y, 1, .4);
    drag.on("pressmove", function (e) {
        var obj = e.target;
        obj.sca(obj.startScale*proportion.convert(obj.startY-obj.y));
    });

    var count = 0;
    drag.on("pressup", function (e) {
        var obj = e.target;
        if (obj.hitTestBounds(obj.answer, -20)) {
            asset("woohoo").play({interrupt:"any"});
            obj.noMouse();
            // Normally we would probably animate the x and y to the answer x and y
            // If the objects are the same size and therefore the tiles are the same size,
            // then you can just animate the object to x:obj.answer.x, y:obj.answer.y
            // If the objects and therefore the tiles are different sizes then you would need:
            // var point = obj.answer.parent.localToLocal(obj.answer.x, obj.answer.y, obj.parent);
            // then animate to x:point.x and y:point.y
            // In this case, we want to animate to the specific spots worked out with .place()
            // These are stored on the object under the custom spot property
            obj.animate({
                props:{x:obj.spot.x, y:obj.spot.y},
                time:.2,
                events:true
            });
            count++;
            if (count >= draggers.length) {
                page.go.loc(678, 576, page).alp(0).animate({
                    props:{alpha:1},
                    wait:1
                });
                page.replay.loc(610, 533, page).alp(0).animate({
                    props:{alpha:1},
                    wait:1.5
                });
            }
        } else {
            asset("tryagain").play({interrupt:"any"});
            obj.animate({
                props:{x:obj.startX, y:obj.startY},
                time:.3,
                events:true
            });
        }
    });

    page.reset = function() {
        drag.loop(function (d) {
            d.x = d.startX;
            d.y = d.startY;
            d.scale = d.startScale;
            d.mouse();
        });
        count = 0;
    }


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
        page.go.animate({alpha:0}, .3);
        page.replay.animate({alpha:0}, .3);
        count = 0;
        loop(draggers, function (d) {
            d.animate({
                props:{x:d.startX, y:d.startY},
                time:.4,
                wait:.5,
                events:true,
                call:function () {
                    d.mouse();
                    page.read = asset("scramble").play();
                }
            });
        });
    });


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({color:green.darken(.7), size:40, align:LEFT});

    new Label("Move the animals to their home!")
        .pos(0,70,CENTER,TOP,page);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    page.readQuestion = function() {
        page.read = asset("drag").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(30,100,LEFT,BOTTOM,page)
            .animate({props:{alpha:.8}, wait:.5})
            .animate({
                props:{x:"10", y:"-100"},
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

    var hand = asset("press.jpg")
        .clone()
        .sca(.5)
        .reg(100,100)
        .rot(10)
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
