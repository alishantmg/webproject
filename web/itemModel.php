<?php
    require_once __DIR__ . '/db.php';

    function createItem($user_id, $title, $description, $item_type, $location) {
        $conn = db_conn();
        $sql = "INSERT INTO items (user_id, title, description, item_type, location) VALUES ($user_id, '$title', '$description', '$item_type', '$location')";
        return mysqli_query($conn, $sql);
    }

    function item_list_all() {
        $conn = db_conn();
        $sql = "SELECT Items.*, Users.Name FROM Items JOIN Users ON Items.user_id = Users.Id
        WHERE Items.status = 'open' AND Users.is_deleted = 0 ORDER BY Items.id DESC";
        $result = mysqli_query($conn, $sql);

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    //list found itemss
    function item_list_found() {
        $conn = db_conn();
        $sql = "SELECT Items.*, Users.Name FROM Items JOIN Users ON Items.user_id = Users.Id
        WHERE Items.item_type ='found' AND Items.status = 'open' AND Users.is_deleted = 0 ORDER BY Items.id DESC";
        $result = mysqli_query($conn, $sql);

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    //list lost items
    function item_list_lost() {
        $conn = db_conn();
        $sql = "SELECT Items.*, Users.Name FROM Items JOIN Users ON Items.user_id = Users.Id
        WHERE Items.item_type ='lost' AND Items.status = 'open' AND Users.is_deleted = 0 ORDER BY Items.id DESC";
        $result = mysqli_query($conn, $sql);

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    //list items by user
    function item_list_by_user($user_id) {
        $conn = db_conn();
        $sql = "SELECT * FROM Items WHERE user_id = $user_id ORDER BY id DESC";
        $result = mysqli_query($conn, $sql);

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    function item_search($search){
        $conn = db_conn();
        $sql = "SELECT Items.*, Users.Name FROM Items JOIN Users ON Items.user_id = Users.Id
        WHERE (Items.title LIKE '%$search%' OR Items.description LIKE '%$search%' OR Items.location LIKE '%$search%')
        AND Items.status = 'open' AND Users.is_deleted = 0 ORDER BY Items.id DESC";
        $result = mysqli_query($conn, $sql);

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    //mark as returned
    function item_mark_returned($id, $user_id) {
        $conn = db_conn();
        $sql = "UPDATE Items SET status = 'returned' WHERE id = $id AND user_id = $user_id";
        return mysqli_query($conn, $sql);
    }

?>