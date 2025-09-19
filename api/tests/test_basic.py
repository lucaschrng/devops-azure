"""
Tests unitaires simples pour vérifier que l'environnement de test fonctionne correctement.
"""

import pytest


def test_simple_addition():
    """Test simple : 1 + 1 = 2"""
    assert 1 + 1 == 2


def test_simple_subtraction():
    """Test simple : 5 - 3 = 2"""
    assert 5 - 3 == 2


def test_simple_multiplication():
    """Test simple : 3 * 4 = 12"""
    assert 3 * 4 == 12


def test_simple_division():
    """Test simple : 10 / 2 = 5"""
    assert 10 / 2 == 5


def test_string_concatenation():
    """Test simple : concaténation de chaînes"""
    assert "Hello" + " " + "World" == "Hello World"


def test_list_operations():
    """Test simple : opérations sur les listes"""
    my_list = [1, 2, 3]
    my_list.append(4)
    assert len(my_list) == 4
    assert my_list[-1] == 4


def test_dictionary_operations():
    """Test simple : opérations sur les dictionnaires"""
    my_dict = {"a": 1, "b": 2}
    my_dict["c"] = 3
    assert len(my_dict) == 3
    assert my_dict["c"] == 3


class TestBasicMath:
    """Classe de tests pour les opérations mathématiques de base"""
    
    def test_addition_positive_numbers(self):
        """Test d'addition avec des nombres positifs"""
        assert 2 + 3 == 5
        assert 10 + 15 == 25
    
    def test_addition_negative_numbers(self):
        """Test d'addition avec des nombres négatifs"""
        assert -1 + -1 == -2
        assert -5 + 3 == -2
    
    def test_zero_operations(self):
        """Test avec zéro"""
        assert 0 + 0 == 0
        assert 5 + 0 == 5
        assert 0 * 100 == 0


@pytest.mark.parametrize("a,b,expected", [
    (1, 1, 2),
    (2, 3, 5),
    (10, 20, 30),
    (-1, 1, 0),
    (0, 0, 0),
])
def test_parametrized_addition(a, b, expected):
    """Test paramétrisé pour l'addition"""
    assert a + b == expected
