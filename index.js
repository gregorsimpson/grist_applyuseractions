  function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const colName_userActions = 'UserActions';
const colName_trigger = 'Trigger';
const colName_setSelectedRows = 'SetSelectedRows';
var tableId = null;
let app = undefined;
let data = {
  status: 'Please select a record.',
  userActions: null,
  trigger: false,
  setSelectedRows: null
}

function handleError(err) {
  console.error('ERROR', err);
  data.status = String(err).replace(/^Error: /, '');
}

async function onRecord(record, mappings) {
  try {
    const mapped = grist.mapColumnNames(record);
    // First check if all columns were mapped.
    if (mapped) {
      colId = mappings[colName_userActions];
      colId2 = mappings[colName_trigger];
      colId3 = mappings[colName_setSelectedRows];
      data.userActions = record[colId];
      data.trigger = record[colId2];
      data.setSelectedRows = record[colId3];
      data.status = `Selected record:\n${tableId}.${colId} at id ${record.id}.\nActions to be applied when trigger fires:\n${data.userActions}`;
      urlparams = new URLSearchParams(window.location.search);
      //new URLSearchParams(window.location.search).get('myparam')
      if (data.setSelectedRows) {
        grist.setSelectedRows(data.setSelectedRows);
      }
      if (urlparams.get('auawidget')) {
        try {
          params = JSON.parse(urlparams.get('auawidget'));
          if (params.setSelectedRows) {
            grist.setSelectedRows(params.setSelectedRows);
          }
          if (params.triggerNow) {
            data.status = 'trigger by url is TRVE';
          }
        } catch (e) {
        }
      }
      if (data.trigger == true) {
        //data.status = `FIRE! dump: tableId="${tableId}" colId="${colId}" colId2="${colId2}" id="${record['id']}" trigger="${data.trigger}"`;
        data.status = `Reverting trigger to False...`;
        await grist.docApi.applyUserActions([['UpdateRecord', tableId, record.id, {
          [colId2]: false
        }]]);
        data.status = `Done. Now applying actions: ${data.userActions}...`;
        await grist.docApi.applyUserActions(data.userActions);
        data.status = `All done.`;
      }
    } else {
      // Helper returned a null value. It means that not all
      // required columns were mapped.
      throw new Error(`Please map all required columns first.`);
    }
  } catch (err) {
    handleError(err);
  }
}

ready(async function() {
  // Update the widget anytime the document data changes.
  await grist.onRecord(onRecord);
  grist.on('message', (e) => {
    if (e.tableId) { tableId = e.tableId; }
  });
  Vue.config.errorHandler = handleError;
  app = new Vue({
    el: '#app',
    data: data
  });
  grist.ready({
    requiredAccess: "full",
    allowSelectBy: true,
    columns: [
      {name: colName_userActions, title: "User Actions (list of lists)"},
      {name: colName_trigger, title: "Trigger (bool)"},
      {name: colName_setSelectedRows, title: "Set selected rows (list of IDs)"}
    ]
  });
});
