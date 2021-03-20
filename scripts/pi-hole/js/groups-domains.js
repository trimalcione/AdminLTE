/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils:false */

let table;
let groups = [];
const token = $("#token").text();
const GETDict = {};
let showtype = "all";

function getGroups() {
  $.post(
    "scripts/pi-hole/php/groups.php",
    { action: "get_groups", token },
    data => {
      groups = data.data;
      initTable();
    },
    "json"
  );
}

$(() => {
  for (const item of window.location.search.substr(1).split("&")) {
    GETDict[item.split("=")[0]] = item.split("=")[1];
  }

  if ("type" in GETDict && (GETDict.type === "white" || GETDict.type === "black")) {
    showtype = GETDict.type;
  }

  // sync description fields, reset inactive inputs on tab change
  $('a[data-toggle="tab"]').on("shown.bs.tab", function () {
    const tabHref = $(this).attr("href");
    let val;
    if (tabHref === "#tab_domain") {
      val = $("#new_regex_comment").val();
      $("#new_domain_comment").val(val);
      $("#new_regex").val("");
    } else if (tabHref === "#tab_regex") {
      val = $("#new_domain_comment").val();
      $("#new_regex_comment").val(val);
      $("#new_domain").val("");
      $("#wildcard_checkbox").prop("checked", false);
    }
  });

  $("#add2black, #add2white").on("click", addDomain);

  utils.setBsSelectDefaults();
  getGroups();
});

function initTable() {
  table = $("#domainsTable").DataTable({
    ajax: {
      url: "scripts/pi-hole/php/groups.php",
      data: { action: "get_domains", showtype, token },
      type: "POST"
    },
    order: [[0, "asc"]],
    columns: [
      { data: "id", visible: false },
      { data: "domain" },
      { data: "type", searchable: false },
      { data: "enabled", searchable: false },
      { data: "comment" },
      { data: "groups", searchable: false, visible: showtype === "all" },
      { data: null, width: "80px", orderable: false }
    ],
    drawCallback() {
      $('button[id^="deleteDomain_"]').on("click", deleteDomain);
      // Remove visible dropdown to prevent orphaning
      $("body > .bootstrap-select.dropdown").remove();
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
        '<code id="domain_' +
          data.id +
          '" title="' +
          tooltip +
          '" class="breakall">' +
          data.domain +
          "</code>"
      );

      let whitelistOptions = "";
      if (showtype === "all" || showtype === "white") {
        whitelistOptions =
          '<option value="0"' +
          (data.type === 0 ? " selected" : "") +
          ">Exact whitelist</option>" +
          '<option value="2"' +
          (data.type === 2 ? " selected" : "") +
          ">Regex whitelist</option>";
      }

      let blacklistOptions = "";
      if (showtype === "all" || showtype === "black") {
        blacklistOptions =
          '<option value="1"' +
          (data.type === 1 ? " selected " : " ") +
          ">Exact blacklist</option>" +
          '<option value="3"' +
          (data.type === 3 ? " selected" : "") +
          ">Regex blacklist</option>";
      }

      $("td:eq(1)", row).html(
        '<select id="type_' +
          data.id +
          '" class="form-control">' +
          whitelistOptions +
          blacklistOptions +
          "</select>"
      );
      const typeEl = $("#type_" + data.id, row);
      typeEl.on("change", editDomain);

      const disabled = data.enabled === 0;
      $("td:eq(2)", row).html(
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
      statusEl.on("change", editDomain);

      $("td:eq(3)", row).html('<input id="comment_' + data.id + '" class="form-control">');
      const commentEl = $("#comment_" + data.id, row);
      commentEl.val(utils.unescapeHtml(data.comment));
      commentEl.on("change", editDomain);

      // Show group assignment field only if in full domain management mode
      if (table.column(5).visible()) {
        $("td:eq(4)", row).empty();
        $("td:eq(4)", row).append(
          '<select class="selectpicker" id="multiselect_' + data.id + '" multiple></select>'
        );
        const selectEl = $("#multiselect_" + data.id, row);
        // Add all known groups
        for (let i = 0; i < groups.length; i++) {
          let dataSub = "";
          if (!groups[i].enabled) {
            dataSub = 'data-subtext="(disabled)"';
          }

          selectEl.append(
            $("<option " + dataSub + "/>")
              .val(groups[i].id)
              .text(groups[i].name)
          );
        }

        // Select assigned groups
        selectEl.val(data.groups);
        // Initialize bootstrap-select
        selectEl
          // fix dropdown if it would stick out right of the viewport
          .on("show.bs.select", () => {
            const winWidth = $(window).width();
            const dropdownEl = $("body > .bootstrap-select.dropdown");
            if (dropdownEl.length > 0) {
              dropdownEl.removeClass("align-right");
              const width = dropdownEl.width();
              const left = dropdownEl.offset().left;
              if (left + width > winWidth) {
                dropdownEl.addClass("align-right");
              }
            }
          })
          .on("changed.bs.select", () => {
            // enable Apply button
            if ($(applyBtn).prop("disabled")) {
              $(applyBtn)
                .addClass("btn-success")
                .prop("disabled", false)
                .on("click", () => {
                  editDomain.call(selectEl);
                });
            }
          })
          .on("hide.bs.select", function () {
            // Restore values if drop-down menu is closed without clicking the Apply button
            if (!$(applyBtn).prop("disabled")) {
              $(this).val(data.groups).selectpicker("refresh");
              $(applyBtn).removeClass("btn-success").prop("disabled", true).off("click");
            }
          })
          .selectpicker()
          .siblings(".dropdown-menu")
          .find(".bs-actionsbox")
          .prepend(
            '<button type="button" id=btn_apply_' +
              data.id +
              ' class="btn btn-block btn-sm" disabled>Apply</button>'
          );
      }

      const applyBtn = "#btn_apply_" + data.id;

      // Highlight row (if url parameter "domainid=" is used)
      if ("domainid" in GETDict && data.id === parseInt(GETDict.domainid, 10)) {
        $(row).find("td").addClass("highlight");
      }

      const button =
        '<button type="button" class="btn btn-danger btn-xs" id="deleteDomain_' +
        data.id +
        '">' +
        '<span class="far fa-trash-alt"></span>' +
        "</button>";
      if (table.column(5).visible()) {
        $("td:eq(5)", row).html(button);
      } else {
        $("td:eq(4)", row).html(button);
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
      utils.stateSaveCallback("groups-domains-table", data);
    },
    stateLoadCallback() {
      const data = utils.stateLoadCallback("groups-domains-table");

      // Return if not available
      if (data === null) {
        return null;
      }

      // Reset visibility of ID column
      data.columns[0].visible = false;
      // Show group assignment column only on full page
      data.columns[5].visible = showtype === "all";
      // Apply loaded state to table
      return data;
    },
    initComplete() {
      if ("domainid" in GETDict) {
        const pos = table
          .column(0, { order: "current" })
          .data()
          .indexOf(parseInt(GETDict.domainid, 10));
        if (pos >= 0) {
          const page = Math.floor(pos / table.page.info().length);
          table.page(page).draw(false);
        }
      }
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
}

function addDomain() {
  const action = this.id;
  const tabHref = $('a[data-toggle="tab"][aria-expanded="true"]').attr("href");
  const wildcardEl = $("#wildcard_checkbox");
  const wildcardChecked = wildcardEl.prop("checked");
  let type;

  // current tab's inputs
  let domainRegex, domainEl, commentEl;
  if (tabHref === "#tab_domain") {
    domainRegex = "domain";
    domainEl = $("#new_domain");
    commentEl = $("#new_domain_comment");
  } else if (tabHref === "#tab_regex") {
    domainRegex = "regex";
    domainEl = $("#new_regex");
    commentEl = $("#new_regex_comment");
  }

  let domain = utils.escapeHtml(domainEl.val());
  const comment = utils.escapeHtml(commentEl.val());

  utils.disableAll();
  utils.showAlert("info", "", "Adding " + domainRegex + "...", domain);

  if (domain.length > 0) {
    // strip "*." if specified by user in wildcard mode
    if (domainRegex === "domain" && wildcardChecked && domain.startsWith("*.")) {
      domain = domain.substr(2);
    }

    // determine list type
    if (domainRegex === "domain" && action === "add2black" && wildcardChecked) {
      type = "3W";
    } else if (domainRegex === "domain" && action === "add2black" && !wildcardChecked) {
      type = "1";
    } else if (domainRegex === "domain" && action === "add2white" && wildcardChecked) {
      type = "2W";
    } else if (domainRegex === "domain" && action === "add2white" && !wildcardChecked) {
      type = "0";
    } else if (domainRegex === "regex" && action === "add2black") {
      type = "3";
    } else if (domainRegex === "regex" && action === "add2white") {
      type = "2";
    }
  } else {
    utils.enableAll();
    utils.showAlert("warning", "", "Warning", "Please specify a " + domainRegex);
    return;
  }

  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: {
      action: "add_domain",
      domain,
      type,
      comment,
      token
    },
    success(response) {
      utils.enableAll();
      if (response.success) {
        utils.showAlert("success", "fas fa-plus", "Success!", response.message);
        domainEl.val("");
        commentEl.val("");
        wildcardEl.prop("checked", false);
        table.ajax.reload(null, false);
      } else {
        utils.showAlert("error", "", "Error while adding new " + domainRegex, response.message);
      }
    },
    error(jqXHR, exception) {
      utils.enableAll();
      utils.showAlert("error", "", "Error while adding new " + domainRegex, jqXHR.responseText);
      console.log(exception); // eslint-disable-line no-console
    }
  });
}

function editDomain() {
  const elem = $(this).attr("id");
  const tr = $(this).closest("tr");
  const id = tr.attr("data-id");
  const domain = utils.escapeHtml(tr.find("#domain_" + id).text());
  const type = tr.find("#type_" + id).val();
  const status = tr.find("#status_" + id).is(":checked") ? 1 : 0;
  const comment = utils.escapeHtml(tr.find("#comment_" + id).val());

  // Show group assignment field only if in full domain management mode
  // if not included, just use the row data.
  const rowData = table.row(tr).data();
  const groups = table.column(5).visible() ? tr.find("#multiselect_" + id).val() : rowData.groups;

  let domainRegex;
  if (type === "0" || type === "1") {
    domainRegex = "domain";
  } else if (type === "2" || type === "3") {
    domainRegex = "regex";
  }

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
    case "comment_" + id:
      done = "edited comment of";
      notDone = "editing comment of";
      break;
    case "type_" + id:
      done = "edited type of";
      notDone = "editing type of";
      break;
    case "multiselect_" + id:
      done = "edited groups of";
      notDone = "editing groups of";
      break;
    default:
      alert("bad element or invalid data-id!");
      return;
  }

  utils.disableAll();
  utils.showAlert("info", "", "Editing " + domainRegex + "...", name);
  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: {
      action: "edit_domain",
      id,
      type,
      comment,
      status,
      groups,
      token
    },
    success(response) {
      utils.enableAll();
      if (response.success) {
        utils.showAlert(
          "success",
          "fas fa-pencil-alt",
          "Successfully " + done + " " + domainRegex,
          domain
        );
        table.ajax.reload(null, false);
      } else
        utils.showAlert(
          "error",
          "",
          "Error while " + notDone + " " + domainRegex + " with ID " + id,
          response.message
        );
    },
    error(jqXHR, exception) {
      utils.enableAll();
      utils.showAlert(
        "error",
        "",
        "Error while " + notDone + " " + domainRegex + " with ID " + id,
        jqXHR.responseText
      );
      console.log(exception); // eslint-disable-line no-console
    }
  });
}

function deleteDomain() {
  const tr = $(this).closest("tr");
  const id = tr.attr("data-id");
  const domain = utils.escapeHtml(tr.find("#domain_" + id).text());
  const type = tr.find("#type_" + id).val();

  let domainRegex;
  if (type === "0" || type === "1") {
    domainRegex = "domain";
  } else if (type === "2" || type === "3") {
    domainRegex = "regex";
  }

  utils.disableAll();
  utils.showAlert("info", "", "Deleting " + domainRegex + "...", domain);
  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: { action: "delete_domain", id, token },
    success(response) {
      utils.enableAll();
      if (response.success) {
        utils.showAlert(
          "success",
          "far fa-trash-alt",
          "Successfully deleted " + domainRegex,
          domain
        );
        table.row(tr).remove().draw(false).ajax.reload(null, false);
      } else {
        utils.showAlert(
          "error",
          "",
          "Error while deleting " + domainRegex + " with ID " + id,
          response.message
        );
      }
    },
    error(jqXHR, exception) {
      utils.enableAll();
      utils.showAlert(
        "error",
        "",
        "Error while deleting " + domainRegex + " with ID " + id,
        jqXHR.responseText
      );
      console.log(exception); // eslint-disable-line no-console
    }
  });
}
