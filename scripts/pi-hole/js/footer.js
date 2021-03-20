/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

//The following functions allow us to display time until pi-hole is enabled after disabling.
//Works between all pages

function secondsTimeSpanToHMS(s) {
  const h = Math.floor(s / 3600); //Get whole hours
  s -= h * 3600;
  const m = Math.floor(s / 60); //Get remaining minutes
  s -= m * 60;
  return h + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s); //zero padding on minutes and seconds
}

function piholeChanged(action) {
  const status = $("#status");
  const ena = $("#pihole-enable");
  const dis = $("#pihole-disable");

  switch (action) {
    case "enabled":
      status.html("<i class='fa fa-circle text-green-light'></i> Active");
      ena.hide();
      dis.show();
      dis.removeClass("active");
      break;

    case "disabled":
      status.html("<i class='fa fa-circle text-red'></i> Offline");
      ena.show();
      dis.hide();
      break;

    default:
    // nothing
  }
}

function countDown() {
  const ena = $("#enableLabel");
  const enaT = $("#enableTimer");
  const target = new Date(parseInt(enaT.html(), 10));
  const seconds = Math.round((target.getTime() - Date.now()) / 1000);

  if (seconds > 0) {
    setTimeout(countDown, 1000);
    ena.text("Enable (" + secondsTimeSpanToHMS(seconds) + ")");
  } else {
    ena.text("Enable");
    piholeChanged("enabled");
    localStorage.removeItem("countDownTarget");
  }
}

function piholeChange(action, duration) {
  const token = encodeURIComponent($("#token").text());
  const enaT = $("#enableTimer");
  let btnStatus;

  switch (action) {
    case "enable":
      btnStatus = $("#flip-status-enable");
      btnStatus.html("<i class='fa fa-spinner'> </i>");
      $.getJSON("api.php?enable&token=" + token, data => {
        if (data.status === "enabled") {
          btnStatus.html("");
          piholeChanged("enabled");
        }
      });
      break;

    case "disable":
      btnStatus = $("#flip-status-disable");
      btnStatus.html("<i class='fa fa-spinner'> </i>");
      $.getJSON("api.php?disable=" + duration + "&token=" + token, data => {
        if (data.status === "disabled") {
          btnStatus.html("");
          piholeChanged("disabled");
          if (duration > 0) {
            enaT.html(Date.now() + duration * 1000);
            setTimeout(countDown, 100);
          }
        }
      });
      break;

    default:
    // nothing
  }
}

function checkMessages() {
  $.getJSON("api_db.php?status", data => {
    if ("message_count" in data && data.message_count > 0) {
      const title =
        data.message_count > 1
          ? "There are " + data.message_count + " warnings. Click for further details."
          : "There is one warning. Click for further details.";

      $("#pihole-diagnosis").prop("title", title);
      $("#pihole-diagnosis-count").text(data.message_count);
      $("#pihole-diagnosis").removeClass("hidden");
    }
  });
}

function testCookies() {
  if (navigator.cookieEnabled) {
    return true;
  }

  // set and read cookie
  document.cookie = "cookietest=1";
  const ret = document.cookie.indexOf("cookietest=") !== -1;

  // delete cookie
  document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";

  return ret;
}

function initCheckboxRadioStyle() {
  function getCheckboxURL(style) {
    const extra = style.startsWith("material-") ? "material" : "bootstrap";
    return "style/vendor/icheck-" + extra + ".min.css";
  }

  function applyCheckboxRadioStyle(style) {
    boxsheet.attr("href", getCheckboxURL(style));
    // Get all radio/checkboxes for theming, with the exception of the two radio buttons on the custom disable timer
    const sel = $("input[type='radio'],input[type='checkbox']").not("#selSec").not("#selMin");
    sel.parent().removeClass();
    sel.parent().addClass("icheck-" + style);
  }

  // Read from local storage, initialize if needed
  let chkboxStyle = localStorage.getItem("theme_icheck");
  if (chkboxStyle === null) {
    chkboxStyle = "primary";
  }

  const boxsheet = $('<link href="' + getCheckboxURL(chkboxStyle) + '" rel="stylesheet" />');
  boxsheet.appendTo("head");

  applyCheckboxRadioStyle(chkboxStyle);

  // Add handler when on settings page
  const iCheckStyle = $("#iCheckStyle");
  if (iCheckStyle !== null) {
    iCheckStyle.val(chkboxStyle);
    iCheckStyle.change(function () {
      const themename = $(this).val();
      localStorage.setItem("theme_icheck", themename);
      applyCheckboxRadioStyle(themename);
    });
  }
}

function initCPUtemp() {
  function setCPUtemp(unit) {
    localStorage.setItem("tempunit", tempunit);
    let temperature = parseFloat($("#rawtemp").text());
    const displaytemp = $("#tempdisplay");
    if (!isNaN(temperature)) {
      switch (unit) {
        case "K":
          temperature += 273.15;
          displaytemp.html(temperature.toFixed(1) + "&nbsp;K");
          break;

        case "F":
          temperature = (temperature * 9) / 5 + 32;
          displaytemp.html(temperature.toFixed(1) + "&nbsp;&deg;F");
          break;

        default:
          displaytemp.html(temperature.toFixed(1) + "&nbsp;&deg;C");
          break;
      }
    }
  }

  // Read from local storage, initialize if needed
  let tempunit = localStorage.getItem("tempunit");
  if (tempunit === null) {
    tempunit = "C";
  }

  setCPUtemp(tempunit);

  // Add handler when on settings page
  const tempunitSelector = $("#tempunit-selector");
  if (tempunitSelector !== null) {
    tempunitSelector.val(tempunit);
    tempunitSelector.change(function () {
      tempunit = $(this).val();
      setCPUtemp(tempunit);
    });
  }
}

$(() => {
  const enaT = $("#enableTimer");
  const target = new Date(parseInt(enaT.html(), 10));
  const seconds = Math.round((target.getTime() - Date.now()) / 1000);
  if (seconds > 0) {
    setTimeout(countDown, 100);
  }

  if (!testCookies() && $("#cookieInfo").length > 0) {
    $("#cookieInfo").show();
  }

  // Apply per-browser styling settings
  initCheckboxRadioStyle();
  initCPUtemp();

  // Run check immediately after page loading ...
  checkMessages();
  // ... and once again with five seconds delay
  setTimeout(checkMessages, 5000);
});

// Handle Enable/Disable
$("#pihole-enable").on("click", e => {
  e.preventDefault();
  localStorage.removeItem("countDownTarget");
  piholeChange("enable", "");
});
$("#pihole-disable-indefinitely").on("click", e => {
  e.preventDefault();
  piholeChange("disable", "0");
});
$("#pihole-disable-10s").on("click", e => {
  e.preventDefault();
  piholeChange("disable", "10");
});
$("#pihole-disable-30s").on("click", e => {
  e.preventDefault();
  piholeChange("disable", "30");
});
$("#pihole-disable-5m").on("click", e => {
  e.preventDefault();
  piholeChange("disable", "300");
});
$("#pihole-disable-custom").on("click", e => {
  e.preventDefault();
  let custVal = $("#customTimeout").val();
  custVal = $("#btnMins").hasClass("active") ? custVal * 60 : custVal;
  piholeChange("disable", custVal);
});

// Session timer
const sessionTimerCounter = document.getElementById("sessiontimercounter");
const sessionvalidity = parseInt(sessionTimerCounter.textContent, 10);
let start = new Date();

function updateSessionTimer() {
  start = new Date();
  start.setSeconds(start.getSeconds() + sessionvalidity);
}

if (sessionvalidity > 0) {
  // setSeconds will correctly handle wrap-around cases
  updateSessionTimer();

  setInterval(() => {
    const current = new Date();
    const totalseconds = (start - current) / 1000;
    let minutes = Math.floor(totalseconds / 60);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }

    let seconds = Math.floor(totalseconds % 60);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    if (totalseconds > 0) {
      sessionTimerCounter.textContent = minutes + ":" + seconds;
    } else {
      sessionTimerCounter.textContent = "-- : --";
    }
  }, 1000);
} else {
  document.getElementById("sessiontimer").style.display = "none";
}

// Handle Strg + Enter button on Login page
$(document).keypress(e => {
  if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey && $("#loginpw").is(":focus")) {
    $("#loginform").attr("action", "settings.php");
    $("#loginform").submit();
  }
});
