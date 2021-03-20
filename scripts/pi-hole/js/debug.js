/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

function eventsource() {
  const ta = $("#output");
  const upload = $("#upload");
  let checked = "";
  const token = encodeURIComponent($("#token").text());

  if (upload.prop("checked")) {
    checked = "upload";
  }

  // IE does not support EventSource - load whole content at once
  if (typeof EventSource !== "function") {
    $.ajax({
      method: "GET",
      url: "scripts/pi-hole/php/debug.php?IE&token=" + token + "&" + checked,
      async: false
    }).done(data => {
      ta.show();
      ta.empty();
      ta.append(data);
    });
    return;
  }

  // eslint-disable-next-line compat/compat
  const source = new EventSource("scripts/pi-hole/php/debug.php?&token=" + token + "&" + checked);

  // Reset and show field
  ta.empty();
  ta.show();

  source.addEventListener(
    "message",
    e => {
      ta.append(e.data);
    },
    false
  );

  // Will be called when script has finished
  source.addEventListener(
    "error",
    () => {
      source.close();
    },
    false
  );
}

$("#debugBtn").on("click", () => {
  $("#debugBtn").prop("disabled", true);
  $("#upload").prop("disabled", true);
  eventsource();
});
