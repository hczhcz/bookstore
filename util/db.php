<?php
    require_once 'config.php';

    $db_conn = new mysqli($db_ip, $db_username, $db_password, $db_name, $db_port);

    if ($db_conn->connect_error) {
        die('DB error: ' . $mysqli->connect_error);
    }

    function db_select(
        $table, $column, $value,
        $begin = 0, $count = 20, $desc = false, $more_cond
    ) {
        global $db_conn;

        if ($desc) {
            $order = 'desc';
        } else {
            $order = 'asc';
        }

        if ($more_cond) {
            $cond = ' and (' . $more_cond . ')';
        } else {
            $cond = '';
        }

        return $db_conn->query('
            select * from `' . $db_conn->escape_string($table) . '`
            where (
                `' . $db_conn->escape_string($column) . '`
                = "' . $db_conn->escape_string($value) . '"
            )' . $cond . '
            order by `' . $db_conn->escape_string($column) . '` ' . $order . '
            limit ' . $begin . ', ' . $count . ';
        ');
    }

    function db_insert($table) {
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
            insert into `' . $db_conn->escape_string($table) . '`
            values (' . $data_str . ');
        ');
    }

    function db_write($table, $data, $replace) {
        global $db_conn;

        if ($replace) {
            $command = 'replace';
        } else {
            $command = 'insert';
        }

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
            ' . $command . ' into `' . $db_conn->escape_string($table) . '` (' . $column_str . ')
            values (' . $data_str . ');
        ');
    }

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
