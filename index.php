<?php
    require_once 'util/config.php';
    require_once 'util/db.php';

    echo $site_name;

    // db_write_dict('buy', array('address'=>'aaa','buy_id'=>'123'));
    $r = db_select('buy', 'address', 'aaa');
    $r1 = $r->fetch_assoc();
    $r1['feedback'] = $r1['feedback'] . 'a';
    db_write_dict('buy', $r1);
?>
