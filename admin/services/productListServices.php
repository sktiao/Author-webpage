<?php
	if (property_exists($data, "request")) {
		if ($data->request == 'getProductList') {
			$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
			if ($result = $mysqli->query("SELECT * FROM products")) {
				$rows = array();
				while ($r = $result->fetch_assoc()) {
					$rows[] = $r;
				}
				echo(json_encode(array("reply"=>"success","data"=>json_encode($rows))));
				$result->close();
			} else {
				echo(json_encode(array("reply"=>"error","message"=>"query failed")));
			}
			$mysqli->close();
		} elseif ($data->request == 'addProducts') {
			if (property_exists($data, "data")) {
				$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
				foreach ($data->data as $product) {
					$fields = "";
					$values = "";
					if (property_exists($product, "name")) {
						$fields .= "name,";
						$values .= "'".$mysqli->real_escape_string($product->name)."',";
					}
					if (property_exists($product, "price")) {
						$fields .= "price,";
						$values .= "'".$mysqli->real_escape_string($product->price)."',";
					}
					if (property_exists($product, "keywords")) {
						$fields .= "keywords,";
						$values .= "'".$mysqli->real_escape_string($product->keywords)."',";
					}
					if (property_exists($product, "description")) {
						$fields .= "description,";
						$values .= "'".$mysqli->real_escape_string($product->description)."',";
					}
					if (property_exists($product, "quantity")) {
						$fields .= "quantity,";
						$values .= "'".$mysqli->real_escape_string($product->quantity)."',";
					}
					$query = "INSERT INTO products (".rtrim($fields,",").") VALUES (".rtrim($values,",").")";
					if ($mysqli->query($query)) {
						//insert success
					} else {
						echo(json_encode(array("reply"=>"error","message"=>"query failed")));
					}
				}
				$mysqli->close();
				echo(json_encode(array("reply"=>"success")));
			} else {
				echo(json_encode(array("reply"=>"error","message"=>"data doesn't exist")));
			}
		} elseif ($data->request == 'deleteProduct') {
			if (property_exists($data, "data")) {
				$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
				if ($mysqli->query("DELETE FROM products WHERE id = ".$data->data)) {
					echo(json_encode(array("reply"=>"success")));
				} else {
					echo(json_encode(array("reply"=>"error","message"=>"query failed")));
				}
				$mysqli->close();
			} else {
				echo(json_encode(array("reply"=>"error","message"=>"id doesn't exist")));
			}
		}
	} else {
		echo(json_encode(array("reply"=>"error","message"=>"request doesn't exist")));
	}
?>