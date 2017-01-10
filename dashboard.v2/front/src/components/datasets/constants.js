export const MYSQL = 'MYSQL';
export const INFLUXDB = 'INFLUXDB';
export const KYLIN = 'KYLIN';
export const HBASE = 'HBASE';

export const DataSetTypes = [{ name: MYSQL, available: true },
  { name: INFLUXDB, available: true },
  { name: KYLIN, available: false },
  { name: HBASE, available: false },
];
