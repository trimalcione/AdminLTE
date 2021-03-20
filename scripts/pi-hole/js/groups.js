/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils:false */

let table;
const token = $("#token").text();

$(() => {
  $("#btnAdd").on("click", addGroup);

  table = $("#groupsTable").DataTable({
    ajax: {
      url: "scripts/pi-hole/php/groups.php",
      data: { action: "get_groups", token },
      type: "POST"
    },
    order: [[0, "asc"]],
    columns: [
      { data: "id", visible: false },
      { data: "name" },
      { data: "enabled", searchable: false },
      { data: "description" },
      { data: null, width: "60px", orderable: false }
    ],
    drawCallback() {
      $('button[id^="deleteGroup_"]').on("click", deleteGroup);
    },
    rowCallback(row, data) {
      $(row).attr("data-id", data.id);
      const tooltip =
        "Added: " +
        utils.datetime(data.date_added, false) +
        "\nLast modified: " +
        utils.datetime(data.date_modified, false) +
        "\nDatabase ID: " +
        data.id;
      $("td:eq(0)", row).html(
        '<input id="name_' + data.id + '" title="' + tooltip + '" class="form-control">'
      );
      const nameEl = $("#name_" + data.id, row);
      nameEl.val(utils.unescapeHtml(data.name));
      nameEl.on("change", editGroup);

      const disabled = data.enabled === 0;
      $("td:eq(1)", row).html(
        '<input type="checkbox" id="status_' + data.id + '"' + (disabled ? "" : " checked") + ">"
      );
      const statusEl = $("#status_" + data.id, row);
      statusEl.bootstrapToggle({
        on: "Enabled",
        off: "Disabled",
        size: "small",
        onstyle: "success",
        width: "80px"
      });
      statusEl.on("change", editGroup);

      $("td:eq(2)", row).html('<input id="desc_' + data.id + '" class="form-control">');
      const desc = data.description !== null ? data.description : "";
      const descEl = $("#desc_" + data.id, row);
      descEl.val(utils.unescapeHtml(desc));
      descEl.on("change", editGroup);

      $("td:eq(3)", row).empty();
      if (data.id !== 0) {
        const button =
          '<button type="button" class="btn btn-danger btn-xs" id="deleteGroup_' +
          data.id +
          '">' +
          '<span class="far fa-trash-alt"></span>' +
          "</button>";
        $("td:eq(3)", row).html(button);
      }
    },
    dom:
      "<'row'<'col-sm-4'l><'col-sm-8'f>>" +
      "<'row'<'col-sm-12'<'table-responsive'tr>>>" +
      "<'row'<'col-sm-5'i><'col-sm-7'p>>",
    lengthMenu: [
      [10, 25, 50, 100, -1],
      [10, 25, 50, 100, "All"]
    ],
    stateSave: true,
    stateSaveCallback(settings, data) {
      utils.stateSaveCallback("groups-table", data);
    },
    stateLoadCallback() {
      const data = utils.stateLoadCallback("groups-table");

      // Return if not available
      if (data === null) {
        return null;
      }

      // Reset visibility of ID column
      data.columns[0].visible = false;
      // Apply loaded state to table
      return data;
    }
  });

  // Disable autocorrect in the search box
  const input = document.querySelector("input[type=search]");
  if (input !== null) {
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", false);
  }

  table.on("order.dt", () => {
    const order = table.order();
    if (order[0][0] !== 0 || order[0][1] !== "asc") {
      $("#resetButton").removeClass("hidden");
    } else {
      $("#resetButton").addClass("hidden");
    }
  });
  $("#resetButton").on("click", () => {
    table.order([[0, "asc"]]).draw();
    $("#resetButton").addClass("hidden");
  });
});

function addGroup() {
  const name = utils.escapeHtml($("#new_name").val());
  const desc = utils.escapeHtml($("#new_desc").val());

  utils.disableAll();
  utils.showAlert("info", "", "Adding group...", name);

  if (name.length === 0) {
    // enable the ui elements again
    utils.enableAll();
    utils.showAlert("warning", "", "Warning", "Please specify a group name");
    return;
  }

  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: { action: "add_group", name, desc, token },
    success(response) {
      utils.enableAll();
      if (response.success) {
        utils.showAlert("success", "fas fa-plus", "Successfully added group", name);
        $("#new_name").val("");
        $("#new_desc").val("");
        table.ajax.reload();
      } else {
        utils.showAlert("error", "", "Error while adding new group", response.message);
      }
    },
    error(jqXHR, exception) {
      utils.enableAll();
      utils.showAlert("error", "", "Error while adding new group", jqXHR.responseText);
      console.log(exception); // eslint-disable-line no-console
    }
  });
}

function editGroup() {
  const elem = $(this).attr("id");
  const tr = $(this).closest("tr");
  const id = tr.attr("data-id");
  const name = utils.escapeHtml(tr.find("#name_" + id).val());
  const status = tr.find("#status_" + id).is(":checked") ? 1 : 0;
  const desc = utils.escapeHtml(tr.find("#desc_" + id).val());

  let done = "edited";
  let notDone = "editing";
  switch (elem) {
    case "status_" + id:
      if (status === 0) {
        done = "disabled";
        notDone = "disabling";
      } else if (status === 1) {
        done = "enabled";
        notDone = "enabling";
      }

      break;
    case "name_" + id:
      done = "edited name of";
      notDone = "editing name of";
      break;
    case "desc_" + id:
      done = "edited description of";
      notDone = "editing description of";
      break;
    default:
      alert("bad element or invalid data-id!");
      return;
  }

  utils.disableAll();
  utils.showAlert("info", "", "Editing group...", name);
  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: {
      action: "edit_group",
      id,
      name,
      desc,
      status,
      token
    },
    success(response) {
      utils.enableAll();
      if (response.success) {
        utils.showAlert("success", "fas fa-pencil-alt", "Successfully " + done + " group", name);
      } else {
        utils.showAlert(
          "error",
          "",
          "Error while " + notDone + " group with ID " + id,
          response.message
        );
      }
    },
    error(jqXHR, exception) {
      utils.enableAll();
      utils.showAlert(
        "error",
        "",
        "Error while " + notDone + " group with ID " + id,
        jqXHR.responseText
      );
      console.log(exception); // eslint-disable-line no-console
    }
  });
}

function deleteGroup() {
  const tr = $(this).closest("tr");
  const id = tr.attr("data-id");
  const name = utils.escapeHtml(tr.find("#name_" + id).val());

  utils.disableAll();
  utils.showAlert("info", "", "Deleting group...", name);
  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: { action: "delete_group", id, token },
    success(response) {
      utils.enableAll();
      if (response.success) {
        utils.showAlert("success", "far fa-trash-alt", "Successfully deleted group ", name);
        table.row(tr).remove().draw(false);
      } else {
        utils.showAlert("error", "", "Error while deleting group with ID " + id, response.message);
      }
    },
    error(jqXHR, exception) {
      utils.enableAll();
      utils.showAlert("error", "", "Error while deleting group with ID " + id, jqXHR.responseText);
      console.log(exception); // eslint-disable-line no-console
    }
  });
}
