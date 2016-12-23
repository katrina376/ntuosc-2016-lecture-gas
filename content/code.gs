function doGet() {
  return HtmlService.createTemplateFromFile('__FILL_UP__')
                    .evaluate()
                    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                    .setTitle('__FILL_UP__')
                    .addMetaTag('viewport', 'width=device-width, initial-scale=1, user-scalable=no');
}

function processForm (d) {
  var spreadsheet = SpreadsheetApp.openById('__FILL_UP__');
  var sheet = spreadsheet.getSheetByName('__FILL_UP__');

  var row = [];

  row.push(d.Name);
  row.push(d.Email);

  var folder = DriveApp.getFolderById('__FILL_UP__');

  var file = folder.createFile(d.Photo);
  file.setName(d.Name);
  row.push(file.getUrl());

  var nDoc = DriveApp.getFileById('__FILL_UP__').makeCopy(d.Name, folder);
  nDoc.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var doc = DocumentApp.openById(nDoc.getId());

  doc.getBody().replaceText('{{ Name }}', d.Name);
  doc.getBody().replaceText('{{ Email }}', d.Email);

  var img = file.getThumbnail();
  if (!img) {
    img = file.getBlob();
  }
  doc.getBody().appendImage(img);

  row.push(doc.getUrl());

  sheet.appendRow(row);

  return;
}

function sendEmail () {
  var spreadsheet = SpreadsheetApp.openById('__FILL_UP__');
  var sheet = spreadsheet.getSheetByName('__FILL_UP__');

  var items = sheet.getRange('1:1').getValues();
  var names = sheet.getRange('A:A').getValues();

  var data = [];

  for (var row = 1; row < names.length; ++row) {
    var rowObj = {};

    for (var col = 0; col < items[0].length; ++col) {
      var item = items[0][col];
      rowObj[item] = sheet.getRange(row+1,col+1);
    }

    data.push(rowObj);
  }


  var sub = '__FILL_UP__';

  for (var i = 0; i < data.length; ++i) {
    var content = 'Name: ' + data[i]['Name'].getValue() + '\n Link: ' + data[i]['Link'].getValue();
    var email = data[i]['Email'].getValue();

    if (!email) {
      break;
    }

    var g = GmailApp.sendEmail(email, sub, content);
  }
}
