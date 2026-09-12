import hashlib
import json
import time


class Blockchain:
    def __init__(self):
        self.chain = []
        self.current_transactions = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        proof = self.proof_of_work(0)
        genesis = {
            "index": 0,
            "timestamp": time.time(),
            "transactions": [],
            "proof": proof,
            "previous_hash": "0",
        }
        self.chain.append(genesis)

    def add_transaction(self, sender, recipient, amount):
        self.current_transactions.append(
            {
                "sender": sender,
                "recipient": recipient,
                "amount": amount,
            }
        )
        return self.last_block["index"] + 1

    def new_block(self, proof=None):
        if proof is None:
            proof = self.proof_of_work(self.last_block["proof"])

        block = {
            "index": len(self.chain),
            "timestamp": time.time(),
            "transactions": self.current_transactions,
            "proof": proof,
            "previous_hash": self.hash_block(self.last_block),
        }
        self.current_transactions = []
        self.chain.append(block)
        return block

    @staticmethod
    def hash_block(block):
        block_payload = {
            "index": block["index"],
            "timestamp": block["timestamp"],
            "transactions": block["transactions"],
            "proof": block["proof"],
            "previous_hash": block["previous_hash"],
        }
        block_string = json.dumps(block_payload, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def proof_of_work(self, last_proof):
        proof = 0
        while not self.valid_proof(last_proof, proof):
            proof += 1
        return proof

    @staticmethod
    def valid_proof(last_proof, proof):
        guess = f"{last_proof}{proof}".encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash.startswith("0000")

    @property
    def last_block(self):
        return self.chain[-1]


if __name__ == "__main__":
    chain = Blockchain()
    chain.add_transaction("Alice", "Bob", 5)
    chain.new_block()
    print(json.dumps(chain.chain, indent=2))
