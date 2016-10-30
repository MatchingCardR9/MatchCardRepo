window.onload = function() {
    function $(sel, all) {
        if (all == true) {
            return document.querySelectorAll(sel);
        } else {
            return document.querySelector(sel);
        }
    }
    // define all variable
    var stage = $("section#memoryBoard"),
        allCon,
        location = false,
        audio = new Audio(),
        sTAudio = new Audio(),
        sTAudioS = false,
        m_array = ['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd', 'e', 'e', 'f',
            'f', 'g', 'g', 'h', 'h', 'i', 'i', 'j', 'j'
        ],
        m_values = [],
        tile_id = [],
        externalMediaDir = "http://www.zahbi.com/game/";
    var Interval = setInterval(timer, 1000);

    function startMusic() {
        sTAudio.src = externalMediaDir + "images/background.mp3"
        sTAudio.setAttribute("status", "play");
        $("span.music").innerHTML = "music : on";
        sTAudio.play();
        sTAudio.loop = true;
    } // close startMusic Func
    Array.prototype.rand = function() {
        var i = this.length,
            j, temp;
        while (--i > 0) {
            j = Math.floor(Math.random() * (i + 1));
            temp = this[j];
            this[j] = this[i];
            this[i] = temp;
        }
    }
    // generating a new elements , make click effect and execute startgame func which adjust the time and make all tile ready

    function newGame() {
        m_array.rand();
        var len = m_array.length,
            ele = "";
        for (i = 0; i < len; i++) {
            ele += (
            "<div id='flip-container' rel><div class='flipper' id='tile_" +
            i +
            "' ><div class='front' style='background-image:url(" +
            externalMediaDir +
            "images/js.png)'></div><div class='back' style='background-image: url(\"" +
            externalMediaDir + "images/" + m_array[i] +
            ".jpg\");'></div></div></div>");
        }
        tile_count = 0;
        maxTime = 60;
        stage.innerHTML = ele;
        allCon = $("div#flip-container", true)
        m_values = [];
        tile_id = [];
        for (var i = 0; i < allCon.length; i++) {
            allCon[i].addEventListener("click", function() {
                selectTile(this);
            });
        }
        window.addEventListener("load", startGame());
        clearInterval(Interval);
        Interval = setInterval(timer, 1000);
    } // close newGame Func

    function startGame() {
        // score render
        $("span.score").innerHTML = m_array.length + "/" + tile_count;
        startMusic();
        $("span.time").innerHTML = maxTime;
        setTimeout(function() {
            for (var i = 0; i < allCon.length; i++) {
                allCon[i].childNodes[0].style.transform =
                    'rotateY(0deg)'
                allCon[i].setAttribute("rel", "");
            }
        }, 3000);
        for (var i = 0; i < allCon.length; i++) {
            allCon[i].childNodes[0].style.transform =
                'rotateY(180deg)'
            allCon[i].setAttribute("rel", "active");
        }
    } // close start game functuin

    function timer() {
        maxTime = maxTime - 1;
        $("span.time").innerHTML = maxTime;
        if (maxTime < 1) {
            clearInterval(Interval);
            var loseAudio = new Audio();
            loseAudio.src = externalMediaDir + 'images/lose.mp3';
            loseAudio.play();
            sTAudio.pause();
            loseAudio.onended = function() {
                alert("You lose this game :) plz try again");
                stage.innerHTML = "";
                newGame();
            }
        }
    } // timer close func

    function selectTile(container) {
        var tile = container.childNodes[0],
            rel = container.getAttribute("rel"),
            val, tileStr;
        if (rel == "" && m_values.length < 2) {
            tile.style.transform = ("rotateY(180deg)");
            container.setAttribute("rel", "active");
            val = getComputedStyle(tile.childNodes[1], null).getPropertyValue(
                "background-image");
            tileStr = val.split("images/");
            tileStr = tileStr[1].split(".jpg");
            tileStr = tileStr[0];
            tileId = tile.id;
            if (m_values.length == 0) {
                m_values.push(tileStr);
                tile_id.push(tileId);
            } else if (m_values.length == 1) {
                m_values.push(tileStr);
                tile_id.push(tileId);
                if (m_values[0] == m_values[1]) {
                    audio.src = externalMediaDir +
                        "images/success.mp3"
                    audio.play();
                    tile_count += 2;
                    $("span.score").innerHTML = m_array.length + "/" +
                        tile_count;
                    $("#" + tile_id[0]).parentNode.style.boxShadow =
                        ("1px 1px 10px 2px #037909");
                    $("#" + tile_id[1]).parentNode.style.boxShadow =
                        ("1px 1px 10px 2px #037909");
                    m_values = [];
                    tile_id = [];
                    if (tile_count == m_array.length) {
                        audio.src = externalMediaDir +
                            "images/win.mp3"
                        audio.play();
                        setTimeout(function() {
                            alert(
                                "You are win try to play another one !!!"
                            );
                            stage.innerHTML = "";
                            newGame();
                        }, 1000);
                    }
                } else {
                    audio.src = externalMediaDir + "images/error.mp3"
                    audio.play();
                    $("#" + tile_id[0]).parentNode.style.boxShadow =
                        ("1px 1px 10px 2px #F00");
                    $("#" + tile_id[1]).parentNode.style.boxShadow =
                        ("1px 1px 10px 2px #F00");
                    setTimeout(function() {
                        $("#" + tile_id[0]).parentNode.style.boxShadow =
                            ("1px 1px 10px 2px #000");
                        $("#" + tile_id[1]).parentNode.style.boxShadow =
                            ("1px 1px 10px 2px #000");
                        $("#" + tile_id[0]).parentNode.setAttribute(
                            "rel", "");
                        $("#" + tile_id[1]).parentNode.setAttribute(
                            "rel", "");
                        $("#" + tile_id[0]).style.transform =
                            ("rotateY(0deg)");
                        $("#" + tile_id[1]).style.transform =
                            ("rotateY(0deg)");
                        m_values = [];
                        tile_id = [];
                    }, 2000);
                }
            }
        }
    } // close selectTile Func
    // The commands
    $("span.music").addEventListener("click", function() {
        if (typeof sTAudioS != "undefined") {
            if (sTAudio.paused == true) {
                $("span.music").innerHTML = "music : on";
                sTAudio.play();
            } else if (sTAudio.paused == false) {
                $("span.music").innerHTML = "music : off";
                sTAudio.pause();
                sTAudio.currentTime = 0;
            }
        }
    });
    $(".newG").addEventListener("click", function() {
        stage.innerHTML = "";
        newGame();
    });
    newGame();
} // close loading Func