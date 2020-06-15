
function makeDifference(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // DIFFERENCE
    // ~~~~~~~~~~~~~~~~~

    // Here we show two pictures with differences
    // In a Container, we created a circle for each difference in a loop with a .place()
    // We then placed the circles at the different places
    // and recorded the locations from the console - that is what place() does
    // We then decided the size of the circles and set the data
    // We then made the loop read from the data
    // We cloned the container for the second picture and moved it over the distance
    // We set it up so clicking an circle brings up its matching circle
    // There is some trickery with containers to get it to work - see the code

    // We have used an Indicator as it clearly shows how many to find
    // ZIM works fine with text and a Label could be used
    // or import game.js for Scorer() and Timer()

    var page = new Page(stageW, stageH, pink.lighten(.2), red.lighten(.1));
    page.quiz = "Difference";
    page.backing.noMouse();

    STYLE = {
        unique:true,
        font:"reuben",
        size:30,
        variant:true,
        color:white,
        align:CENTER,
    };


    var pic1 = asset("mantis.jpg").sca(1.3).center(page).mov(-220,100).ble("multiply").noMouse();
    var pic2 = asset("mantis2.jpg").clone().sca(1.3).center(page).mov(220,100).ble("multiply").noMouse();

    var indicator = page.indicator = new Indicator({
        indicatorType:"square",
        num:5,
        fill:true,
        foregroundColor:green,
        backgroundColor:purple,
        selectedIndex:-1
    }).sca(1.5).centerReg(page).mov(0,-120);

    // we will make circles that can be pressed to reveal the spots
    // on the canvas, invisible things will not reveive a mouse interaction
    // so a Circle with a color of clear - or "rgba(0,0,0,0)" cannot be clicked
    // We can use expand() which uses the CreateJS hitArea - but that is a full bounding rectangle
    // We could use a hitTestPoint() or getObjectUnderPoint()
    // but placing the circles behind the backing also works
    // if we make the pictures and backing not receive the mouse...
    // but then we can't swipe - so we have added a swiper Rectangle under everything
    // sounds like a lot - but it takes less than a minute
    // When we press on a circle we will use the addTo() to add to containers on top
    // this has the handy feature that it will keep the visible location across containers

    var circles = new Container(stageW, stageH).addTo(page).bot();
    var circlesTop = new Container(stageW, stageH).addTo(page);
    var spots = [
        {x:433, y:509, r:40, n:"butt"}, // name not used but just to help keep track
        {x:427, y:574, r:20, n:"foot"},
        {x:300, y:514, r:30, n:"middle"},
        {x:196, y:504, r:30, n:"arm"},
        {x:172, y:429, r:26, n:"eyes"}];
    loop(5, function (i) {
        new Circle(spots[i].r, "rgba(255,255,255,.2)",white,2).loc(spots[i], null, circles) // .place();
    });
    var circles2 = circles.clone().addTo(page).bot().mov(pic2.x-pic1.x);
    var circles2Top = new Container(stageW, stageH).addTo(page);
    circles2.getChildAt(0).mov(3,5);
    circles2.getChildAt(1).mov(-15);

    // pair up circles
    circles.loop(function (c,i) {
        var pair = circles2.getChildAt(i);
        c.pair = pair;
        pair.pair = c;
    })

    circles.on("mousedown", showCircle);
    circles2.on("mousedown", showCircle);

    function showCircle(e) {
        var circle = e.target;
        var parent = circle.parent;
        circle.addTo(parent==circles?circlesTop:circles2Top);
        circle.pair.addTo(parent==circles?circles2Top:circlesTop);
        asset("woohoo.mp3").play({interrupt:"any"});
        indicator.selectedIndex++;
        if (indicator.selectedIndex == indicator.num-1) {
            emitter.spurt(130);

            page.go.loc(821, 283, page).alp(0).animate({
                props:{alpha:1},
                wait:1
            }); //.place();
            page.replay.loc(749, 242, page).alp(0).animate({
                props:{alpha:1},
                wait:1.5
            }); //.place();

        }
        stage.update();
    }

    // the rectangle underneath everything so we can still swipe
    var swiper = new Rectangle(stageW, stageH).addTo(page).bot();


    var emitter = new Emitter({
        obj:new Rectangle(10, 10, [purple, green, dark, white, green]),
        random:{scale:{min:1, max:3}, rotation:{min:0, max:360}},
        horizontal:true,
        width:indicator.width,
        force:{min:4, max:8},
        life:1.7,
        gravity:16,
        height:10,
        num:2,
        angle:{min:-90-40, max:-90+40},
        startPaused:true
    }).loc(indicator, null, page).mov(0,-10);


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
        page.read = asset("difference").play();
        page.go.animate({alpha:0}, .3);
        page.replay.animate({alpha:0}, .3);
        interval(.1, function () {
            indicator.selectedIndex--;
        }, indicator.num, true);

        circlesTop.animate({
            props:{alpha:0},
            time:.7
        });
        circles2Top.animate({
            props:{alpha:0},
            time:.7,
            call:function () {
                page.reset();
            }
        });
    });

    page.reset = function() {
        // loop all trans
        circlesTop.loop(function (c) {
            c.addTo(circles);
        }, true); // loop backwards when removing
        circlesTop.alp(1);
        circles2Top.loop(function (c) {
            c.addTo(circles2);
        }, true);
        circles2Top.alp(1);
        indicator.selectedIndex = -1;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({color:green.darken(.7), size:40, align:LEFT});

    // new Label("Press the different parts of the pictures!")
    new Label("Press where the pictures are different!")
        .pos(0,70,CENTER,TOP,page);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    page.readQuestion = function() {
        page.read = asset("difference").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(30,100,LEFT,BOTTOM,page)
            .animate({props:{alpha:.8}, wait:.5})
            .animate({
                props:{x:"20", y:"-30"},
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
