<?php
  require_once 'db_config.php';

  function db_conn(){
    static $conn =null;
    if ($conn === null) {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if(mysqli_connect_errno()){
            echo("Database connection failed: " . mysqli_connect_error() );
        }

    }
    return $conn;
    }
?>