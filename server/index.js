"use strict";

const AWS = require('aws-sdk');

const Dynamo = new AWS.DynamoDB();

const tableNameParam = 'STATS_TABLE_TABLE_NAME';

const tableName = process.env[tableNameParam];

exports.handle = async function handle(
    event, context
) {

    console.log('headers', event.headers);
    console.log('body', event.body);

    return {
        statusCode: 204,
        body: ''
    }
};