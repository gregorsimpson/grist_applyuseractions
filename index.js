  function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const column = 'UserActions';
const column2 = 'Trigger';
var tableId = null;
let app = undefined;
let data = {
  status: 'waiting',
  result: null,
  input: null,
  trigger: false
  /*input: {
    actions: null,
  }*/
}

function handleError(err) {
  console.error('ERROR', err);
  data.status = String(err).replace(/^Error: /, '');
}

/*async function applyActions() {
  data.results = "Working...";
  try {
    //await grist.docApi.ApplyUserActions(['UpdateRecord', TABLENAME??, {'TRIGGERCOLUMN_NAME???': false}]);
    //await grist.docApi.applyUserActions(data.input.actions);
    await grist.docApi.applyUserActions(data.input);
    data.status = 'Done';
  } catch (e) {
    data.status = `Please grant full access for writing. (${e})`;
  }
}*/

function onRecord(record, mappings) {
  data.status = 'Executing actions...';
  //data.result = null;
  try {
    const mapped = grist.mapColumnNames(record);
    // First check if all columns were mapped.
    if (mapped) {
      colId = mappings[column];
      colId2 = mappings[column2];
      data.input = record[colId];
      data.trigger = record[colId2];
      let records = {
        id: record['id'],
        fields: {
          trigger: false
        }
      }
      if (data.trigger == true) {
        data.status = `TRIGGERED! dump: tableId="${tableId}" colId="${colId}" colId2="${colId2}" id="${record['id']}" trigger="${data.trigger}"`;
        /*grist.docApi.applyUserActions(['UpdateRecord', tableId, record.id {
          trigger: false
        }]);*/
      }
    } else {
      // Helper returned a null value. It means that not all
      // required columns were mapped.
      throw new Error(`Please map all required columns.`);
    }
  } catch (err) {
    handleError(err);
  }
}

ready(function() {
  grist.ready({columns: [
    {name: column, title: "User Actions (list)"},
    {name: column2, title: "Trigger (bool)"}
  ]});
  // Update the widget anytime the document data changes.
  grist.onRecord(onRecord);
  grist.on('message', (e) => {
    if (e.tableId) { tableId = e.tableId; }
  });
  Vue.config.errorHandler = handleError;
  app = new Vue({
    el: '#app',
    data: data
  });
});
