from unittest.mock import patch

import pytest

from blockchain import Blockchain


def test_valid_proof_accepts_known_good_pair():
    last_proof = 100
    proof = 35293
    assert Blockchain.valid_proof(last_proof, proof) is True


def test_valid_proof_rejects_bad_pair():
    assert Blockchain.valid_proof(100, 1) is False


def test_hash_block_is_deterministic():
    block = {
        "index": 1,
        "timestamp": 1234567890.0,
        "transactions": [{"sender": "A", "recipient": "B", "amount": 1}],
        "proof": 42,
        "previous_hash": "abc",
    }
    assert Blockchain.hash_block(block) == Blockchain.hash_block(block)


def test_hash_block_changes_when_content_changes():
    base = {
        "index": 1,
        "timestamp": 1234567890.0,
        "transactions": [],
        "proof": 42,
        "previous_hash": "abc",
    }
    other = {**base, "proof": 43}
    assert Blockchain.hash_block(base) != Blockchain.hash_block(other)


@patch.object(Blockchain, "proof_of_work", return_value=999)
def test_genesis_block_structure(mock_pow):
    chain = Blockchain()
    mock_pow.assert_called_once_with(0)
    assert len(chain.chain) == 1
    genesis = chain.chain[0]
    assert genesis["index"] == 0
    assert genesis["transactions"] == []
    assert genesis["proof"] == 999
    assert genesis["previous_hash"] == "0"
    assert "timestamp" in genesis


@patch.object(Blockchain, "proof_of_work", return_value=999)
def test_add_transaction_queues_and_returns_next_index(mock_pow):
    chain = Blockchain()
    next_index = chain.add_transaction("Alice", "Bob", 5)
    assert next_index == 1
    assert chain.current_transactions == [
        {"sender": "Alice", "recipient": "Bob", "amount": 5}
    ]


@patch.object(Blockchain, "proof_of_work", side_effect=[999, 12345])
def test_new_block_appends_and_clears_pending(mock_pow):
    chain = Blockchain()
    chain.add_transaction("Alice", "Bob", 5)
    block = chain.new_block()

    assert len(chain.chain) == 2
    assert block["index"] == 1
    assert block["proof"] == 12345
    assert block["transactions"] == [
        {"sender": "Alice", "recipient": "Bob", "amount": 5}
    ]
    assert block["previous_hash"] == Blockchain.hash_block(chain.chain[0])
    assert chain.current_transactions == []


@patch.object(Blockchain, "proof_of_work", return_value=999)
def test_last_block_property(mock_pow):
    chain = Blockchain()
    assert chain.last_block is chain.chain[-1]
