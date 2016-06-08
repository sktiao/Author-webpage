<?php
	if ($data->request == "getCategoryList") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$result = $mysqli->query("SELECT * FROM categories");
		$rows = array();
		while ($r = $result->fetch_assoc()) {
			$rows[] = $r;
		}
		$mysqli->close();
		exit(json_encode(array("reply"=>"success","message"=>json_encode($rows))));
	} elseif ($data->request == "addCategory") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$name = $mysqli->real_escape_string($data->name);
		$image = base64_encode($name);
		$mysqli->query("INSERT INTO categories (name,image) VALUES ('".$name."','".$image."')");
		$mysqli->close();
		exit(json_encode(array("reply"=>"success")));
	} elseif ($data->request == "updateCategory") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$id = $mysqli->real_escape_string($data->id);
		$newId = $mysqli->real_escape_string($data->newId);
		$newName = $mysqli->real_escape_string($data->newName);
		$result = $mysqli->query("UPDATE categories SET id = '".$newId."', name = '".$newName."' WHERE id = ".$id);
		$mysqli->close();
		exit(json_encode(array("reply"=>"success")));
	} elseif ($data->request == "deleteCategory") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$id = $mysqli->real_escape_string($data->id);
		$result = $mysqli->query("DELETE FROM categories WHERE id = ".$id);
		$mysqli->close();
		exit(json_encode(array("reply"=>"success")));
	}
?>