/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils:false */

let table;
const token = $("#token").text();

function showAlert(type, message) {
  let alertElement = null;
  let messageElement = null;

  switch (type) {
    case "info":
      alertElement = $("#alInfo");
      break;
    case "success":
      alertElement = $("#alSuccess");
      break;
    case "warning":
      alertElement = $("#alWarning");
      messageElement = $("#warn");
      break;
    case "error":
      alertElement = $("#alFailure");
      messageElement = $("#err");
      break;
    default:
      return;
  }

  if (messageElement !== null) messageElement.html(message);

  alertElement.fadeIn(200);
  alertElement.delay(8000).fadeOut(2000);
}

$(() => {
  $("#btnAdd").on("click", addCustomDNS);

  table = $("#customDNSTable").DataTable({
    ajax: {
      url: "scripts/pi-hole/php/customdns.php",
      data: { action: "get", token },
      type: "POST"
    },
    columns: [{}, { type: "ip-address" }, { orderable: false, searchable: false }],
    columnDefs: [
      {
        targets: 2,
        render(data, type, row) {
          return (
            '<button type="button" class="btn btn-danger btn-xs deleteCustomDNS" data-domain=\'' +
            row[0] +
            "' data-ip='" +
            row[1] +
            "'>" +
            '<span class="far fa-trash-alt"></span>' +
            "</button>"
          );
        }
      }
    ],
    lengthMenu: [
      [10, 25, 50, 100, -1],
      [10, 25, 50, 100, "All"]
    ],
    order: [[0, "asc"]],
    stateSave: true,
    stateSaveCallback(settings, data) {
      utils.stateSaveCallback("LocalDNSTable", data);
    },
    stateLoadCallback() {
      return utils.stateLoadCallback("LocalDNSTable");
    },
    drawCallback() {
      $(".deleteCustomDNS").on("click", deleteCustomDNS);
    }
  });
  // Disable autocorrect in the search box
  const input = document.querySelector("input[type=search]");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", false);
});

function addCustomDNS() {
  const ip = utils.escapeHtml($("#ip").val());
  const domain = utils.escapeHtml($("#domain").val());

  showAlert("info");
  $.ajax({
    url: "scripts/pi-hole/php/customdns.php",
    method: "post",
    dataType: "json",
    data: { action: "add", ip, domain, token },
    success(response) {
      if (response.success) {
        showAlert("success");
        table.ajax.reload();
      } else showAlert("error", response.message);
    },
    error() {
      showAlert("error", "Error while adding this custom DNS entry");
    }
  });
}

function deleteCustomDNS() {
  const ip = $(this).attr("data-ip");
  const domain = $(this).attr("data-domain");

  showAlert("info");
  $.ajax({
    url: "scripts/pi-hole/php/customdns.php",
    method: "post",
    dataType: "json",
    data: { action: "delete", domain, ip, token },
    success(response) {
      if (response.success) {
        showAlert("success");
        table.ajax.reload();
      } else showAlert("error", response.message);
    },
    error(jqXHR, exception) {
      showAlert("error", "Error while deleting this custom DNS entry");
      console.log(exception); // eslint-disable-line no-console
    }
  });
}
