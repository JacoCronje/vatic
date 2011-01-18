function ui_build(job)
{
    var screen = ui_setup(job);
    var videoframe = $("#videoframe");
    var player = new VideoPlayer(videoframe, job);
    var tracks = new TrackCollection(player, job);
    var drawer = new BoxDrawer(videoframe);

    ui_setupbuttons(player, tracks);
    ui_setupslider(player);
    ui_setupnewobjects(player, tracks, drawer)
}

function ui_setupnewobjects(player, tracks, drawer)
{
    var colors = null;
    var trackobject = null;

    $("#newobjectbutton").button({
        icons: {
            primary: "ui-icon-plusthick",
            disabled: false
        }
    }).click(function() {
        if (colors != null)
        {
            return;
        }

        colors = ui_pickcolor();
        drawer.color = colors[0];
        drawer.enable();

        $(this).button("option", "disabled", true);

        trackobject = $("<div class='trackobject'><div>");
        trackobject.prependTo($("#objectcontainer"));
        trackobject.css({
            'background-color': colors[1],
            'border-color': colors[0]});
        trackobject.html("Person");
    });

    drawer.onstopdraw.push(function(position) {
        var track = tracks.add(player.frame, position, colors[0]);

        drawer.disable();
        colors = null;
        $("#newobjectbutton").button("option", "disabled", false);

        trackobject.hover(function() {
            tracks.dim(true);
            track.dim(false);
            track.highlight(true);
        }, function() {
            tracks.dim(false);
            track.highlight(false);
        });
    });
}

function ui_setup(job)
{
    var screen = $("<div id='annotatescreen'></div>").appendTo(container);

    $("<table>" + 
        "<tr>" +
              "<td><div id='videoframe'></div></td>" + 
              "<td><div id='sidebar'></div></td>" +
          "</tr>" + 
          "<tr>" +
              "<td><div id='bottombar'></div></td>" + 
              "<td><div id='submitbar'></div></td>" +
          "</tr>" +
          "<tr>" +
              "<td><div id='advancedoptions'></div></td>" +
          "</tr>" +
      "</table>").appendTo(screen).css("width", "100%");

    $("#videoframe").css({"width": job.width + "px",
                          "height": job.height + "px"})
                    .parent().css("width", job.width + "px");

    $("#bottombar").append("<div id='playerslider'></div>");
    $("#bottombar").append("<div class='button' id='playbutton'>Play</div> ");
    $("#bottombar").append("<div class='button' id='rewindbutton'>Rewind</div>");

    $("#sidebar").append("<div id='newobjectcontainer'>" +
        "<div class='button' id='newobjectbutton'>New Object</div></div>");

    $("#sidebar").append("<div id='objectcontainer'></div>");

    $("<div class='button' id='openadvancedoptions'>Options</div>")
        .button({
            icons: {
                primary: "ui-icon-wrench"
            }
        }).appendTo($("#advancedoptions").parent()).click(function() {
                $(this).remove();
                $("#advancedoptions").show();
            });

    $("#advancedoptions").hide();

    $("#advancedoptions").append(
    "<input type='checkbox' id='annotateoptionsresize'>" +
    "<label for='annotateoptionsresize'>Disable Resize?</label> " +
    "<input type='checkbox' id='annotateoptionshideboxes'>" +
    "<label for='annotateoptionshideboxes'>Hide Boxes?</label> ");

    $("#advancedoptions").append(
    "<div id='speedcontrol'>" +
    "<input type='radio' name='speedcontrol' " +
        "value='15,1' id='speedcontrolslow'>" +
    "<label for='speedcontrolslow'>Slow</label>" +
    "<input type='radio' name='speedcontrol' " +
        "value='30,1' id='speedcontrolnorm' checked='checked'>" +
    "<label for='speedcontrolnorm'>Normal</label>" +
    "<input type='radio' name='speedcontrol' " +
        "value='30,3' id='speedcontrolfast'>" +
    "<label for='speedcontrolfast'>Fast</label>" +
    "</div>");

    return screen;
}

function ui_setupbuttons(player, tracks)
{
    $("#playbutton").click(function() {
        player.toggle();
    }).button({
        icons: {
            primary: "ui-icon-play"
        }
    });

    $("#rewindbutton").click(function() {
        player.pause();
        player.seek(player.job.start);
    }).button({
        text: false,
        disabled: true,
        icons: {
            primary: "ui-icon-seek-first"
        }
    });

    player.onplay.push(function() {
        $("#playbutton").button("option", {
            label: "Pause",
            icons: {
                primary: "ui-icon-pause"
            }
        });
    });

    player.onpause.push(function() {
        $("#playbutton").button("option", {
            label: "Play",
            icons: {
                primary: "ui-icon-play"
            }
        });
    });

    player.onupdate.push(function() {
        if (player.frame == player.job.stop)
        {
            $("#playbutton").button("option", "disabled", true);
        }
        else if ($("#playbutton").button("option", "disabled"))
        {
            $("#playbutton").button("option", "disabled", false);
        }

        if (player.frame == player.job.start)
        {
            $("#rewindbutton").button("option", "disabled", true);
        }
        else if ($("#rewindbutton").button("option", "disabled"))
        {
            $("#rewindbutton").button("option", "disabled", false);
        }
    });

    $("#speedcontrol").buttonset();
    $("input[name='speedcontrol']").click(function() {
        player.fps = parseInt($(this).val().split(",")[0]);
        player.playdelta = parseInt($(this).val().split(",")[1]);
        console.log("Change FPS to " + player.fps);
        console.log("Change play delta to " + player.playdelta);
        if (!player.paused)
        {
            player.pause();
            player.play();
        }
    });

    $("#annotateoptionsresize").button().click(function() {
        if ($(this).attr("checked"))
        {
            tracks.disableresize();
        }
        else
        {
            tracks.enableresize();
        }
    });

    $("#annotateoptionshideboxes").button().click(function() {
        if ($(this).attr("checked"))
        {
            tracks.hideboxes();
        }
        else
        {
            tracks.showboxes();
        }
    });

    $(window).keypress(function(e) {
        if (e.keyCode == 112)
        {
            $("#playbutton").click();
        }
        if (e.keyCode == 114)
        {
            $("#rewindbutton").click();
        }
        else if (e.keyCode == 110)
        {
            $("#newobjectbutton").click();
        }
        else if (e.keyCode == 60 || e.keyCode == 44)
        {
            player.pause();
            player.displace(-10);
        }
        else if (e.keyCode == 62 || e.keyCode == 46)
        {
            player.pause();
            player.displace(10);
        }
        console.log("Key press: " + e.keyCode);
    });
}

function ui_setupslider(player)
{
    var slider = $("#playerslider");
    slider.slider({
        range: "min",
        value: player.job.start,
        min: player.job.start,
        max: player.job.stop,
        slide: function(event, ui) {
            player.pause();
            player.seek(ui.value);
        }
    });

    slider.css({
        marginTop: "6px",
        width: "590px",
        float: "right"
    });

    player.onupdate.push(function() {
        slider.slider({value: player.frame});
    });
}

/*
 * The colors we will cycle through when displaying tracks.
 */
var ui_colors = [["#FF0000", "#FFBFBF"],
                 ["#0000FF", "#BFBFFF"],
                 ["#008000", "#8FBF8F"],
                 ["#FF00FF", "#FFBFFF"],
                 ["#0080FF", "#BFDFFF"],
                 ["#FF8000", "#FFBFBF"],
                 ["#000080", "#8F8FBF"],
                 ["#800000", "#BF8F8F"],
                 ["#800080", "#BF8FBF"],
                 ["#FFE100", "#FFF8BF"]];

function ui_pickcolor()
{
    // move first element to end, then get last
    return ui_colors[ui_colors.push(ui_colors.shift()) - 1];
}
