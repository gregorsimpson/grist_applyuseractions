  function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const col_name_actions = 'UserActions';
const col_name_trigger = 'Trigger';
var tableId = null;
let app = undefined;
let data = {
  status: 'Please select a record.',
  userActions: null,
  trigger: false
  /*userActions: {
    actions: null,
  }*/
}

function handleError(err) {
  console.error('ERROR', err);
  data.status = String(err).replace(/^Error: /, '');
}

async function onRecord(record, mappings) {
  try {
    const mapped = grist.mapcol_name_actionsNames(record);
    // First check if all columns were mapped.
    if (mapped) {
      colId = mappings[col_name_actions];
      colId2 = mappings[col_name_trigger];
      data.userActions = record[colId];
      data.trigger = record[colId2];
      data.status = `Selected record: ${tableId}.${colId} at id ${record.id}.\nActions to be applied when trigger fires:\n${data.userActions}`;
      if (data.trigger == true) {
        data.status = `FIRE! dump: tableId="${tableId}" colId="${colId}" colId2="${colId2}" id="${record['id']}" trigger="${data.trigger}"`;
        await grist.docApi.applyUserActions([['UpdateRecord', tableId, record.id, {
          [colId2]: false
        }]]);
        data.status = `Applying actions: ${data.userActions}`;
        await grist.docApi.applyUserActions(data.userActions);
      }
    } else {
      // Helper returned a null value. It means that not all
      // required col_name_actionss were mapped.
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
  grist.ready({col_name_actionss: [
    {name: col_name_actions, title: "User Actions (list)"},
    {name: col_name_trigger, title: "Trigger (bool)"}
  ]});
});
