from __future__ import annotations

import functools
from dataclasses import dataclass
import json


@dataclass()
class Variable:
    type: str
    name: str

    def __repr__(self):
        return f'{self.type} {self.name}'

    @property
    def num_bits(self):
        if self.type[-2:] == '[]':
            return 256
        if self.type == 'bool':
            return 8
        if self.type[:4] == 'uint':
            size = self.type[4:]
            if len(size) == 0:
                return 256
            assert size.isdigit()
            return int(size)
        if self.type[:3] == 'int':
            size = self.type[3:]
            if len(size) == 0:
                return 256
            assert size.isdigit()
            return int(size)
        if self.type == 'address':
            return 160
        if self.type == 'byte':
            return 8
        if self.type == 'bytes':
            return 256
        if self.type[:5] == 'bytes':
            size = self.type[5:]
            assert size.isdigit()
            return int(size) * 8
        if self.type == 'string':
            return 256
        assert False


@functools.total_ordering
class VariablesPermutation(tuple[Variable]):
    @property
    def num_slots(self):
        num_slots = 0
        current_size = 256
        for var in self:
            var_size = var.num_bits
            if current_size + var_size > 256:
                num_slots += 1
                current_size = var_size
            else:
                current_size += var_size
        return num_slots

    def __eq__(self, other: VariablesPermutation):
        if len(self) != len(other):
            return False
        for i in range(len(self)):
            if self[i].name != other[i].name:
                return False
        return True

    def __lt__(self, other: VariablesPermutation):
        for i in range(min(len(self), len(other))):
            if self[i].name < other[i].name:
                return True
            if self[i].name > other[i].name:
                return False
        return len(self) < len(other)


def pack_structs(variables):
    import itertools
    variables = [Variable(*var.strip().split(' ')) for var in ' '.join(variables).split(';')[:-1]]

    # noinspection PyUnboundLocalVariable
    permutations = [VariablesPermutation(permutation) for permutation in itertools.permutations(variables)]
    max_slots = max(permutations, key=lambda p: p.num_slots).num_slots
    min_slots = min(permutations, key=lambda p: p.num_slots).num_slots
    permutations = sorted(filter(lambda p: p.num_slots == min_slots, permutations), reverse=True)
    winning_order_function = ';\n'.join(str(var) for var in permutations[-1]) + ';'
    winning_order_type = ','.join(str(var) for var in permutations[-1])
    # print(f'original slots: {VariablesPermutation(variables).num_slots}   min slots: {min_slots}   '
    #         f'max slots: {max_slots}\n\n{winning_order_function}\n\n{winning_order_type}')

    dictionary = {
        'original_slots': VariablesPermutation(variables).num_slots,
        'min_slots': min_slots,
        'max_slots': max_slots,
        'winning_order_function': winning_order_function.split('\n'),
        'winning_order_type': winning_order_type.split(',')
    }
    return json.dumps(dictionary, indent = 4) 
