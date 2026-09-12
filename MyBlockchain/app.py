import json

from flask import Flask, jsonify, redirect, render_template, request, url_for

from blockchain import Blockchain

app = Flask(__name__)
blockchain = Blockchain()


@app.route("/")
def index():
    return render_template(
        "index.html",
        chain=blockchain.chain,
        pending=blockchain.current_transactions,
    )


@app.route("/chain")
def full_chain():
    return jsonify(blockchain.chain)


@app.route("/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json(silent=True) or request.form
    sender = data.get("sender")
    recipient = data.get("recipient")
    amount = data.get("amount")

    if not sender or not recipient or amount is None:
        return jsonify({"error": "sender, recipient, and amount are required"}), 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({"error": "amount must be a number"}), 400

    block_index = blockchain.add_transaction(sender, recipient, amount)

    if request.is_json:
        return jsonify(
            {
                "message": "Transaction queued",
                "block_index": block_index,
                "pending": blockchain.current_transactions,
            }
        ), 201

    return redirect(url_for("index"))


@app.route("/mine", methods=["POST"])
def mine():
    block = blockchain.new_block()

    if request.is_json:
        return jsonify(
            {
                "message": "New block mined",
                "block": block,
                "chain_length": len(blockchain.chain),
            }
        ), 201

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
