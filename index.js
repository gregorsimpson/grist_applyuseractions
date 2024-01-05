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

async function applyActions() {
  data.results = "Working...";
  try {
    //await grist.docApi.applyUserActions(data.input.actions);
    await grist.docApi.applyUserActions(data.input);
    data.status = 'Done';
  } catch (e) {
    data.status = `Please grant full access for writing. (${e})`;
  }
}

function onRecord(row, mappings) {
  try {
    data.status = '';
    data.result = null;
    // If there is no mapping, test the original record.
    row = grist.mapColumnNames(row) || row;
    if (!row.hasOwnProperty(column)) {
      throw new Error(`Need a visible column named "${column}". You can map a custom column in the Creator Panel.`);
    }
    if (!row.hasOwnProperty(column2)) {
      throw new Error(`Need a visible column named "${column2}". You can map a custom column in the Creator Panel.`);
    }
    /*const keys = ['actions'];
    if (!row[column] || keys.some(k => !row[column][k])) {
      const allKeys = keys.map(k => JSON.stringify(k)).join(", ");
      const missing = keys.filter(k => !row[column]?.[k]).map(k => JSON.stringify(k)).join(", ");
      const gristName = mappings?.[column] || column;
      throw new Error(`"${gristName}" cells should contain an object with keys ${allKeys}. ` +
        `Missing keys: ${missing}`);
    }*/
    data.input = row[column];
    data.trigger = row[column2];
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
    data: data,
    methods: {applyActions}
  });
});
