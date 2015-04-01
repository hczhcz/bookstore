<?php
    require_once 'config.php';

    $db_conn = new mysqli($db_ip, $db_username, $db_password, $db_name, $db_port);

    if ($db_conn->connect_error) {
        die('DB error: ' . $mysqli->connect_error);
    }

    function db_select($table, $column, $value, $begin = 0, $count = 1000, $desc = false) {
        global $db_conn;

        if ($desc) {
            $order = 'desc';
        } else {
            $order = 'asc';
        }

        return $db_conn->query('
            select * from `' . $db_conn->escape_string($table) . '`
            where `' . $db_conn->escape_string($column) . '` = "' . $db_conn->escape_string($value) . '"
            order by `' . $db_conn->escape_string($column) . '` ' . $order . '
            limit ' . $begin . ', ' . $count . '
        ');
    }

    function db_write($table) {
        global $db_conn;

        $data_str = '';

        for ($i = 1; $i < func_num_args(); $i += 1) {
            $value = func_get_arg($i);

            if ($i == 1) {
                $data_str = '"' . $db_conn->escape_string($value) . '"';
            } else {
                $data_str = $data_str . ', "' . $db_conn->escape_string($value) . '"';
            }
        }

        return $db_conn->query('
            replace into `' . $db_conn->escape_string($table) . '`
            values (' . $data_str . ')
        ');
    }

    function db_write_dict($table, $data) {
        global $db_conn;

        $column_str = '';
        $data_str = '';

        foreach ($data as $key => $value) {
            if ($value != null) {
                if ($column_str == '') {
                    $column_str = '`' . $db_conn->escape_string($key) . '`';
                    $data_str = '"' . $db_conn->escape_string($value) . '"';
                } else {
                    $column_str = $column_str . ', `' . $db_conn->escape_string($key) . '`';
                    $data_str = $data_str . ', "' . $db_conn->escape_string($value) . '"';
                }
            }
        }

        return $db_conn->query('
            replace into `' . $db_conn->escape_string($table) . '` (' . $column_str . ')
            values (' . $data_str . ')
        ');
    }
?>
