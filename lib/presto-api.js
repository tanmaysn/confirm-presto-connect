var presto = require('presto-client');
var _ = require('lodash');
var jsonConvertor = require('./arrayToJson');

var client = new presto.Client({ user: 'highways', host: '152.144.218.78', port: '8080' });

var stateFn = function (error, query_id, stats) {
    console.log({ message: "status changed", id: query_id, stats: stats });
};

var columnsFn = function (error, data) {
    console.log({ resultColumns: data });
};

exports.executeQuery = function (query, callback) {
    var aggregatedData = [];
    var cols = [];
    
    client.execute({
        query: query,
        catalog: 'sqlserver',
        schema: 'highways',
        state: stateFn,
        columns: columnsFn,
        data: function (error, data, columns, stats) {
            aggregatedData = _.concat(aggregatedData, data);                     
            cols = columns;
        },

        success: function (error, stats) {
            
            var obj = jsonConvertor.convertToJson(aggregatedData, cols);
            callback(obj);
        },

        error: function (error) {
            console.log(error);
            callback(undefined, error.message);
        }
    });
};

exports.executeQueryBasic = function (query, callback) {

    // client.catalog - 'sqlserver';
    // client.schema = 'highways';     

    var localClient = new presto.Client({ user: 'highways', host: '152.144.218.78', port: '8080', catalog: 'sqlserver', schema: 'highways' });

    localClient.execute(query,
        function (error, data, columns) {
            console.log(data);
            console.log(error);
            callback(data);
        }
    );
}
