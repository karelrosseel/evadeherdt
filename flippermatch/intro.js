
function makeIntro(stage) {
    var stageW = stage.width;
    var stageH = stage.height;

    // ~~~~~~~~~~~~~~~~~
    // INTRO
    // this is the splash page which introduces the app
    // it also is a requirement to interact with the page before sound can be played
    // Each page in the Quiz is made in a Page() object
    // that is returned to the main code to handle going between pages
    // Any other objects needed in the main code are stored on the page as properties

    // We have made a collage of our pictures
    // but you would replace this with your own splash page
    // that would most likely be something like:

    // var page = new Page(stageW, stageH, green);
    // new Label("Welcome to the Wild Life Quiz!").pos(0,50,CENTER,TOP,page);
    // asset("intro.jpg").center(page);
    // page.go = new Button({label:"START"}).pos(0,50,CENTER,BOTTOM,page);
    // page.music = new CheckBox({label:"music", startChecked:true})
    //     .sca(.6).alp(.8).pos(60,50,LEFT,BOTTOM,page)
    // stage.update();
    // return page; // send back the page to the main code page
    // // the control of the button would happen in the main code page

    var page = new Page(stageW, stageH, green);

    STYLE = {font:"reuben", size:50};

    // We have made a dynamic collage for our intro
    // Here is an common alternative to load an image
    // asset("intro.jpg").center(page).mov(0,-30);

    // comment out or remove the collage if using the image intro above
    makeCollage()
    function makeCollage() {

        shuffle(animals); // animals is the global variable with all the animal file names
        // just want to keep the giraffe more centered on top!
        var g = animals.indexOf("giraffe.jpg")
        if (g<5 || g>animals.length/2-5) {
            animals.splice(g,1); // remove the giraffe
            var r = rand(5, Math.floor(animals.length/2)-5); // get random index at top
            animals.splice(r,0,"giraffe.jpg"); // insert the giraffe
        }

        var count = 0;
        function makeAsset() {
            // the post assignment incrementing operator (++)
            // increases the number after it is used - so this starts with the 0 element
            // the images are on white background so use the blendMode "multiply"
            // this will multiply it by the color underneath and white is like 1
            // so 1 times the color underneath is the color underneath!
            // Whereas black is like 0 so 0 times the color underneath is 0 or black!
            // Note - the stage color is not considered a color underneath
            // so we would need a backing rectangle... luckily, Page() comes with a backing rectangle ;-)
            return asset(animals[count++]).clone().sca(1).ble("multiply").alp(0);
        }

        // often we tile an object, sometimes a series or array of objects
        // but here we call a function that returns the object
        // this allows us to get the asset() that matches the name in the array
        new Tile({
            obj:makeAsset, // call this function to get a tile object
            cols:animals.length/2,
            rows:2,
            mirrorV:true, // flip the next row - this is in Tile exactly for this reason - to make art
            valign:series(BOTTOM,TOP), // first row aligns bottom, second row aligns tops
            align:CENTER,
            colSize:40,
            spacingV:-50 // the pictures have some built in whitespace so bring closer
        }).center(page).noMouse().mov(0,-20).animate({
            props:{alpha:.5},
            time:1,
            sequence:.02,
            call:function () {
                title.animate({alpha:1}, .5);
            }
        });

        var title = new Label({
            size:130,
            color:green,
            text:"WILDLIFE!",
            outlineColor:green.darken(.2),
            outlineWidth:1
        })
            .center(page)
            .mov(0,60)
            .alp(0);

    }  // end of makeCollage

    // ~~~~~~~~~~~
    // if loading an image for the intro rather than the collage
    // then you may want to adjust the timing of these animations

    stage.frame.makeIcon()
        .sca(.45)
        .loc(25,23,page)
        .alp(0)
        .animate({
            props:{alpha:.9},
            time:.3,
            wait:1.6
        })
        .tap(function () {
            zgo("https://zimjs.com", "_blank");
        });

    new Label({
        color:purple,
        text:"Learning Quiz!",
        size:45,
        variant:true
    })
        .pos(90,30,null,null,page)
        .alp(0)
        .animate({
            props:{alpha:.9},
            wait:1.7
        });

    // this button and the toggle need to be used by the main script
    // so store them on the intro page which is being returned to the main script
    page.go = new Button({
        width:140,
        height:140,
        backgroundColor:purple,
        rollBackgroundColor:orange,
        label:"GO",
        corner:70
    })
        .centerReg(page)
        .pos(50,50,RIGHT,BOTTOM)
        .sca(0)
        .animate({
            wait:1.5,
            props:{scale:1},
            ease:"backOut",
            time:.5
        });

    page.music = new Toggle({label:"music", color:green.darken(.5), startToggled:true})
        .sca(.8)
        .pos(40,40,LEFT,BOTTOM,page)
        .alp(0)
        .animate({
            props:{alpha:.8},
            wait:3
        });

    return page;
}
