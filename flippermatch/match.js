
function makeMatch(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // MATCH
    // ~~~~~~~~~~~~~~~~~

    // Match is the classic concentration-like card-flipping game
    // We will probably move the Fliper into ZIM Cat 01 when it launches
    // Again, we make use of storing the match on the objects so when we test - it is an easy compare

    var page = new Page(stageW, stageH, pink, purple);
    page.quiz = "Match";

    STYLE = {
        unique:true,
        font:"reuben",
        size:30,
        variant:true,
        color:white,
        align:CENTER,
    };


    var pics = ["squid.jpg", "seahorse.jpg", "shell.jpg", "crab.jpg"];

    // This will be moved into ZIM for the next version of Cat.
    class Flipper extends Container {
       constructor(front, back, time, vertical, flipped, easeRoot, frontPress, backPress) {

           if (zot(time)) time = .2;
           if (zot(vertical)) vertical = false;
           if (zot(flipped)) flipped = false;
           if (zot(easeRoot)) easeRoot = "quad";
           if (zot(frontPress)) frontPress = true;
           if (zot(backPress)) backPress = true;

           if (flipped) [front,back]=[back,front];
           const w = Math.max(front.width,back.width);
           const h = Math.max(front.height,back.height);
           super(w,h);
           this.type = "Flipper";
           this.cur();
           this.flipped = flipped;
           const that = this;

           front.centerReg(this);
           if (frontPress) front.on("mousedown", ()=>{spin(front,back);});
           if (backPress) back.on("mousedown", ()=>{spin(back,front,-1);});
           front.oScale = front.scale;
           back.oScale = back.scale;
           front.flipper = that;
           back.flipper = that;
           front.mouseChildren = false;
           back.mouseChildren = false;
           that.front = front;
           that.back = back;

           this.flip = function(state, time) {
               if (state == that.flipped) return;
               if (!that.flipped) spin(front,back,1,time);
               else spin(back,front,-1,time);
           }
           function spin(f, b, d=1, t) { // current front, back, direction
               if (zot(t)) t = time;
               that.flipped = !that.flipped;
               if (t==0) {
                   that.removeAllChildren();
                   b.scale = b.oScale;
                   b.skewX = b.skewY = 0;
                   b.centerReg(that);
                   that.dispatchEvent("flipped");
                   return;
               }
               if (vertical) {
                   var props1 = {skewX:-90*d, scaleY:f.oScale/2};
                   var props2 = {skewX:0, scaleY:b.oScale}
                   b.ske(90*d,0).sca(1,.5);
               } else {
                   var props1 = {skewY:-90*d, scaleX:f.oScale/2};
                   var props2 = {skewY:0, scaleX:b.oScale}
                   b.ske(0,90*d).sca(b.oScale/2,b.oScale);
               }
               f.animate({
                   props:props1,
                   time:time,
                   ease:easeRoot+"In",
                   call:() => {
                       f.removeFrom();
                       b.centerReg(that).animate({
                           props:props2,
                           time:time,
                           ease:easeRoot+"Out",
                           call:function () {
                               that.dispatchEvent("flipped");
                           }
                       });
                   }
               });
           }
       }
   } // end Flipper


   var answers = shuffle(pics.concat(pics,pics,pics)); // four sets or two sets of matches
   var index = 0;
   function makeCard() {
       var front = stage.frame.makeIcon().sca(1.1);
       back = new Page(front.width,front.height,blue,green);
       var answer = answers[index++];
       asset(answer).clone().scaleTo(back,95,95).center(back).ble("multiply");
       var card = new Flipper(front, back, null, null, null, null, false, false).centerReg({add:false});
       card.answer = answer; // store on card for ease of collection
       return card;
   }

   var cards = new Tile({
       obj:makeCard,
       cols:4,
       rows:4,
       spacingH:20,
       spacingV:15,
       unique:false,
       clone:false
   }).center(page).mov(0,50);

   var cardCount = 0;
   var testing = false;
   var lastCard;
   cards.on("mousedown", function (e) {
       if (testing) return;
       var card = e.target.flipper;
       cardCount++;
       card.flip();
       card.noMouse();
       if (cardCount%2 == 0) {
           testing = true;
           if (lastCard.answer != card.answer)  {
               timeout(.5, function () {
                   asset("tryagain").play({interrupt:"any"});
                   timeout(1, function () {
                       card.flip();
                       lastCard.flip();
                       card.mouse();
                       lastCard.mouse();
                       testing = false;
                       lastCard = null;
                   })
               });
           } else {
               // let them look a little
               timeout(1, function () {
                   asset("woohoo").play({interrupt:"any"});
                   card.animate({rotation:720, alpha:0}, 1, "backIn");
                   lastCard.animate({
                       props:{rotation:720, alpha:0},
                       time:1,
                       ease:"backIn",
                       wait:.3,
                       call:function () {
                           card.rotation = 0;
                           lastCard.rotation = 0;
                           testing = false;
                           lastCard = null;
                           // test for last match
                           var done = cards.loop(function (card) {
                               if (card.alpha > 0) return false;
                           });
                           if (done) {
                               // shuffle the cards
                               shuffle(answers);
                               var index = 0;
                               cards.loop(function (card) {
                                   card.back.getChildAt(card.back.numChildren-1).removeFrom();
                                   var answer = answers[index++];
                                   asset(answer).clone().scaleTo(card,95,95).center(card.back).ble("multiply");
                                   card.flip(false, 0);
                                   card.answer = answer;
                                   card.mouse();
                               });
                               cards.animate({
                                   props:{alpha:1},
                                   time:.7,
                                   sequence:.1,
                                   call:function () {
                                       page.go.center(page).mov(0,30).alp(0).animate({alpha:1});
                                       page.replay.loc(page.go, null, page).mov(-66,-16).alp(0).animate({alpha:1});
                                   }
                               });
                           }
                       }
                   });
               });
           }

       } else {
           lastCard = card;
       }
   })


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
        asset("match").play();
        page.go.animate({alpha:0}, .3);
        page.replay.animate({alpha:0}, .3);
    })


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HEADING

    Style.add({color:green.darken(.7), size:40, align:LEFT});

    new Label("Find the matching animals!")
        .pos(0,70,CENTER,TOP,page);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~
    // HELP
    // we want to read the question and animate the help
    // when the page is done transitioning
    // this is in the main script so store the function on the page
    page.readQuestion = function() {
        page.read = asset("match").play();
        help.animate({scale:0}, .7, "backIn");
        hand.pos(100,200,LEFT,BOTTOM,page)
            .animate({props:{alpha:.8}, wait:.5})
            .animate({
                props:{x:"20"},
                time:.7,
                loopCount:2,
                wait:.7,
                loopWait:.3,
                rewind:true,
                loopCall:function () {
                    hand.pos(100,350,LEFT,BOTTOM,page)
                },
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
    new Label({font:"verdana", size:16, color:white, text:page.quiz.toUpperCase()}).centerReg(page).loc(icon).mov(0,45).alp(.8);


    return page; // so main script has access to this page and its properties
};
