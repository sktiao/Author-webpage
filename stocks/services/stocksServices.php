<?php
	if ($post->request == "getStockHistoricals") {
		if (property_exists($post,"data") && property_exists($post->data,"symbol")) {
			$lines = file("http://ichart.finance.yahoo.com/table.csv?s=".$post->data->symbol);
			echo(json_encode($lines));
		} else {
			echo("no data or symbol");
		}
	}
	if ($post->request == "buyStock") {
		if ($token = checkToken()) {
			if (property_exists($post,"data") && property_exists($post->data,"symbol") && property_exists($post->data,"shares")) {
				$symbol = $post->data->symbol;
				if ($result = @file_get_contents("http://finance.yahoo.com/webservice/v1/symbols/".$symbol."/quote?format=json&view=detail")) {
					$result = json_decode($result);
					if (count($result->list->resources)) {
						$price = round($result->list->resources[0]->resource->fields->price,2);
						$shares = $post->data->shares;
						$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
						$username = getTokenClaims($token)->user;
						if ($result = $mysqli->query("SELECT portfolio FROM users WHERE username = '".$username."'")) {
							$row = $result->fetch_assoc();
							$portfolio = json_decode($row["portfolio"]);
							$cash = $portfolio->cash;
							if ($cash >= $price * $shares) {
								$portfolio->cash -= $price * $shares;
								$portfolio->cash = round($portfolio->cash,2);
								$index = -1;
								foreach ($portfolio->stocks as $key=>$stock) {
									if ($stock->symbol == $symbol) {
										$stock->shares += $shares;
										$index = $key;
									}
								}
								if ($index === -1) {
									array_push($portfolio->stocks,json_decode("{\"symbol\":\"".$symbol."\",\"shares\":".$shares."}"));
								}
								$portfolio = json_encode($portfolio);
								if ($mysqli->query("UPDATE users SET portfolio = '".$portfolio."' WHERE username = '".$username."'")) {
									echo(json_encode(array("reply"=>"success")));
								} else {
									echo("query UPDATE failed");
								}
							} else {
								echo("not enough cash");
							}
						} else {
							echo("query SELECT failed");
						}
						$mysqli->close();
					} else {
						echo("no such symbol");
					}
				} else {
					echo("yahoo finance api failed");
				}
			} else {
				echo("no data or symbol or shares");
			}
		} else {
			echo("no token");
		}
	}
	if ($post->request == "sellStock") {
		if ($token = checkToken()) {
			if (property_exists($post,"data") && property_exists($post->data,"symbol") && property_exists($post->data,"shares")) {
				$symbol = $post->data->symbol;
				if ($result = @file_get_contents("http://finance.yahoo.com/webservice/v1/symbols/".$symbol."/quote?format=json&view=detail")) {
					$result = json_decode($result);
					if (count($result->list->resources)) {
						$price = round($result->list->resources[0]->resource->fields->price,2);
						$shares = $post->data->shares;
						$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
						$username = getTokenClaims($token)->user;
						if ($result = $mysqli->query("SELECT portfolio FROM users WHERE username = '".$username."'")) {
							$row = $result->fetch_assoc();
							$portfolio = json_decode($row["portfolio"]);
							$cash = $portfolio->cash;
							$sharesOwned = 0;
							foreach ($portfolio->stocks as $stock) {
								if ($stock->symbol == $symbol) {
									$sharesOwned = $stock->shares;
								}
							}
							if ($sharesOwned >= $shares) {
								$portfolio->cash += $price * $shares;
								$portfolio->cash = round($portfolio->cash,2);
								$index = -1;
								foreach ($portfolio->stocks as $key=>$stock) {
									if ($stock->symbol == $symbol) {
										$stock->shares -= $shares;
										if ($stock->shares == 0) {
											$index = $key;
										}
									}
								}
								if ($index !== -1) {
									unset($portfolio->stocks[$index]);
								}
								$portfolio = json_encode($portfolio);
								if ($mysqli->query("UPDATE users SET portfolio = '".$portfolio."' WHERE username = '".$username."'")) {
									echo(json_encode(array("reply"=>"success")));
								} else {
									echo("query UPDATE failed");
								}
							} else {
								echo("not enough shares owned");
							}
						} else {
							echo("query SELECT failed");
						}
						$mysqli->close();
					} else {
						echo("no such symbol");
					}
				} else {
					echo("yahoo finance api failed");
				}
			} else {
				echo("no data or symbol or shares");
			}
		} else {
			echo("no token");
		}
	}
?>