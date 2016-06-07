<?php
	if ($data->request == "getProductList") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$result = $mysqli->query("SELECT * FROM products");
		$rows = array();
		while ($r = $result->fetch_assoc()) {
			$rows[] = $r;
		}
		$mysqli->close();
		exit(json_encode(array("reply"=>"success","message"=>json_encode($rows))));
	} elseif ($data->request == "getCategoryList") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$result = $mysqli->query("SELECT * FROM categories");
		$rows = array();
		while ($r = $result->fetch_assoc()) {
			$rows[] = $r;
		}
		$mysqli->close();
		exit(json_encode(array("reply"=>"success","message"=>json_encode($rows))));
	} elseif ($data->request == "addProduct") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$category = $mysqli->real_escape_string($data->category);
		$name = $mysqli->real_escape_string($data->name);
		$price = $mysqli->real_escape_string($data->price);
		$brand = $mysqli->real_escape_string($data->brand);
		$description = $mysqli->real_escape_string($data->description);
		$quantity = $mysqli->real_escape_string($data->quantity);
		$result = $mysqli->query("INSERT INTO products (category,name,price,brand,description,quantity) VALUES ('".$category."','".$name."','".$price."','".$brand."','".$description."','".$quantity."')");
		$mysqli->close();
		exit(json_encode(array("reply"=>"success")));
	} elseif ($data->request == "updateProduct") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$id = $mysqli->real_escape_string($data->id);
		$newId = $mysqli->real_escape_string($data->newId);
		$newCategory = $mysqli->real_escape_string($data->newCategory);
		$newName = $mysqli->real_escape_string($data->newName);
		$newPrice = $mysqli->real_escape_string($data->newPrice);
		$newBrand = $mysqli->real_escape_string($data->newBrand);
		$newDescription = $mysqli->real_escape_string($data->newDescription);
		$newQuantity = $mysqli->real_escape_string($data->newQuantity);
		$result = $mysqli->query("UPDATE products SET id = '".$newId."', category = '".$newCategory."', name = '".$newName."', price = '".$newPrice."', brand = '".$newBrand."', description = '".$newDescription."', quantity = '".$newQuantity."' WHERE id = ".$id);
		$mysqli->close();
		exit(json_encode(array("reply"=>"success")));
	} elseif ($data->request == "deleteProduct") {
		$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
		$id = $mysqli->real_escape_string($data->id);
		$result = $mysqli->query("DELETE FROM products WHERE id = ".$id);
		$mysqli->close();
		exit(json_encode(array("reply"=>"success")));
	}
?>