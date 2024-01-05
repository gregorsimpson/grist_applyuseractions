function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const column = 'UserActions';
const column2 = 'Trigger';
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
      data.input = record[column];
      data.trigger = record[column2];
      let records = {
        id: record['id'],
        fields: {
          trigger: false
        }
      }
      if (data.trigger == true) {
        data.status = `dump: table="${grist.selectedTable}" update="${grist.selectedTable.update}" id="${record['id']}"`;
        //grist.docApi.applyUserActions(['UpdateRecord', 
        //grist.selectedTable.update(records);
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
  // Update the widget anytime the document data changes.
  grist.ready({columns: [
    {name: column, title: "User Actions (list)"},
    {name: column2, title: "Trigger (bool)"}
  ]});
  grist.onRecord(onRecord);

  Vue.config.errorHandler = handleError;
  app = new Vue({
    el: '#app',
    data: data
  });
});
