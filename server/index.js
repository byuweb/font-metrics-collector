"use strict";

const AWS = require('aws-sdk');
const useragent = require('useragent');

const Dynamo = new AWS.DynamoDB();

const tableNameParam = 'STATS_TABLE_TABLE_NAME';

const tableName = process.env[tableNameParam];

exports.handle = async function handle(
    event, context
) {

    console.log('headers', event.headers);
    console.log('body', event.body);

    const agent = useragent.parse(event.headers['User-Agent']);
    console.log('user agent', agent.family, agent.major);

    return {
        statusCode: 204,
        body: ''
    }
};