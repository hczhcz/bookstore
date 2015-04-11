<?php
    require_once 'config.php';

    // connect to the database

    $db_conn = new mysqli($db_ip, $db_username, $db_password, $db_name, $db_port);

    if ($db_conn->connect_error) {
        die('DB error: ' . $mysqli->connect_error);
    }

    $db_conn->query('set character set "utf8";');
    $db_conn->query('set names "utf8";');

    // select rows in the database by a simple rule
    function db_select(
        $table, $cond_column, $cond_value,
        $begin = 0, $count = 50, $order = null, $desc = false
    ) {
        global $db_conn;

        if ($desc) {
            $ordertag = 'desc';
        } else {
            $ordertag = 'asc';
        }

        if ($order === null) {
            $order = $cond_column;
        }

        return $db_conn->query('
            select * from `' . $db_conn->escape_string($table) . '`
            where (
                `' . $db_conn->escape_string($cond_column) . '`
                = "' . $db_conn->escape_string($cond_value) . '"
            )
            order by `' . $db_conn->escape_string($order) . '` ' . $ordertag . '
            limit ' . intval($begin) . ', ' . intval($count) . ';
        ');
    }

    // select rows in the database by some rules
    function db_select_complex(
        $table, $cond /* raw */, $cond_values,
        $begin = 0, $count = 50, $order = null, $desc = false
    ) {
        global $db_conn;

        if ($desc) {
            $ordertag = 'desc';
        } else {
            $ordertag = 'asc';
        }

        // if ($order === null) {
        //     $order = $column;
        // }

        $args = array();

        foreach ($cond_values as $key => $value) {
            $args[$key] = '"' . $db_conn->escape_string($value) . '"';
        }

        return $db_conn->query('
            select * from `' . $db_conn->escape_string($table) . '`
            where (
                ' . vsprintf($cond, $args) . '
            )
            order by `' . $db_conn->escape_string($order) . '` ' . $ordertag . '
            limit ' . intval($begin) . ', ' . intval($count) . ';
        ');
    }

    // add a row to the database
    function db_insert($table /* var args */) {
        global $db_conn;

        $data_str = '';

        for ($i = 1; $i < func_num_args(); $i += 1) {
            $value = func_get_arg($i);

            if ($value !== null) {
                if ($i === 1) {
                    $data_str = '"' . $db_conn->escape_string($value) . '"';
                } else {
                    $data_str = $data_str . ', "' . $db_conn->escape_string($value) . '"';
                }
            } else {
                if ($i === 1) {
                    $data_str = 'null';
                } else {
                    $data_str = $data_str . ', null';
                }
            }
        }

        return $db_conn->query('
            insert into `' . $db_conn->escape_string($table) . '`
            values (' . $data_str . ');
        ');
    }

    // update an exist row
    function db_update(
        $table, $cond_column, $cond_value,
        $expr /* raw */, $values = array()
    ) {
        global $db_conn;

        $args = array();

        foreach ($values as $key => $value) {
            $args[$key] = '"' . $db_conn->escape_string($values[$key]) . '"';
        }

        return $db_conn->query('
            update `' . $db_conn->escape_string($table) . '`
            set ' . vsprintf($expr, $args) . '
            where (
                `' . $db_conn->escape_string($cond_column) . '`
                = "' . $db_conn->escape_string($cond_value) . '"
            );
        ');
    }

    // write (insert or replace) data to the database
    // function db_write($table, $data, $replace) {
    //     global $db_conn;

    //     if ($replace) {
    //         $command = 'replace';
    //     } else {
    //         $command = 'insert ignore';
    //     }

    //     $column_str = '';
    //     $data_str = '';

    //     foreach ($data as $key => $value) {
    //         if ($value !== null) {
    //             if ($column_str === '') {
    //                 $column_str = '`' . $db_conn->escape_string($key) . '`';
    //                 $data_str = '"' . $db_conn->escape_string($value) . '"';
    //             } else {
    //                 $column_str = $column_str . ', `' . $db_conn->escape_string($key) . '`';
    //                 $data_str = $data_str . ', "' . $db_conn->escape_string($value) . '"';
    //             }
    //         }
    //     }

    //     return $db_conn->query('
    //         ' . $command . ' into `' . $db_conn->escape_string($table) . '` (' . $column_str . ')
    //         values (' . $data_str . ');
    //     ');
    // }

    // remove rows in the database
    function db_delete($table, $column, $value) {
        global $db_conn;

        return $db_conn->query('
            delete from `' . $db_conn->escape_string($table) . '`
            where (
                `' . $db_conn->escape_string($column) . '`
                = "' . $db_conn->escape_string($value) . '"
            );
        ');
    }
?>
