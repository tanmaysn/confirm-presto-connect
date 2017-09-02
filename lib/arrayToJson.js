var _ = require('lodash');

exports.convertToJson = function(data, columns){

    var completeObject = [];
    if (_.isArray(data) && _.isArray(columns)) {

        _.each(data, function (dataElement) {
            var columnCount = 0;
            var element = {};
            completeObject.push(element);

            _.each(columns, function (column) {
                try{
                    var value;
                    var colType = column.type.toLowerCase();
                    if (!dataElement[columnCount]) {
                        value = null;
                    } else if (colType === 'int') {
                        value = parseInt(dataElement[columnCount]);
                    } else if (colType === 'double') {
                        value = parseFloat(dataElement[columnCount]);
                    } else if (colType.startsWith('varchar')) {
                        value = dataElement[columnCount];
                    }
                    element[column.name] = value;
                    
                } catch(ex){
                    console.log(ex);
                } finally{
                    columnCount++;
                }
            });
        });
    }

    return completeObject;
}