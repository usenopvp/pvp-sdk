// Generated from the PVP program and app sources; do not edit by hand.
export default {
  "address": "4716RUH7qqikpxf6sQAp33xUaJMBD3y6QeAnndH4iV3M",
  "metadata": {
    "name": "pvp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "PVP launchpad: tokens whose name can change, one live name per 24 hours"
  },
  "instructions": [
    {
      "name": "block_name",
      "discriminator": [
        25,
        10,
        137,
        92,
        199,
        253,
        154,
        209
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "operator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "blocked",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name_key",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claim_curve_fees",
      "discriminator": [
        67,
        48,
        233,
        11,
        25,
        119,
        172,
        15
      ],
      "accounts": [
        {
          "name": "cranker",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "dbc_config",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "dbc_pool",
          "writable": true,
          "relations": [
            "curve"
          ]
        },
        {
          "name": "base_vault",
          "writable": true
        },
        {
          "name": "quote_vault",
          "writable": true
        },
        {
          "name": "quote_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "authority_base",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "fee_buffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "stake_pool",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "holder_rewards",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pvp_token",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  118,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "reward_vault",
          "writable": true
        },
        {
          "name": "team_wsol",
          "writable": true
        },
        {
          "name": "pvp_stake_pool"
        },
        {
          "name": "pvp_reward_vault",
          "writable": true
        },
        {
          "name": "dbc_pool_authority"
        },
        {
          "name": "dbc_event_authority"
        },
        {
          "name": "dbc_program",
          "address": "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "quote_token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claim_holder_rewards",
      "discriminator": [
        79,
        182,
        142,
        158,
        108,
        127,
        120,
        174
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "holder_rewards",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "holder_rewards.mint",
                "account": "HolderRewards"
              }
            ]
          }
        },
        {
          "name": "reward_claim",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "holder_rewards.mint",
                "account": "HolderRewards"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "relations": [
            "holder_rewards"
          ]
        },
        {
          "name": "wsol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "user_wsol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cumulative",
          "type": "u64"
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    },
    {
      "name": "claim_partner_surplus",
      "discriminator": [
        88,
        48,
        210,
        241,
        182,
        188,
        75,
        118
      ],
      "accounts": [
        {
          "name": "cranker",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "dbc_config",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "dbc_pool",
          "writable": true,
          "relations": [
            "curve"
          ]
        },
        {
          "name": "base_vault",
          "writable": true
        },
        {
          "name": "quote_vault",
          "writable": true
        },
        {
          "name": "quote_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "authority_base",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "fee_buffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "stake_pool",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "holder_rewards",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pvp_token",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  118,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "reward_vault",
          "writable": true
        },
        {
          "name": "team_wsol",
          "writable": true
        },
        {
          "name": "pvp_stake_pool"
        },
        {
          "name": "pvp_reward_vault",
          "writable": true
        },
        {
          "name": "dbc_pool_authority"
        },
        {
          "name": "dbc_event_authority"
        },
        {
          "name": "dbc_program",
          "address": "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "quote_token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claim_pool_fees",
      "discriminator": [
        33,
        187,
        125,
        186,
        41,
        247,
        236,
        89
      ],
      "accounts": [
        {
          "name": "cranker",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "damm_pool"
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "position_nft_account"
        },
        {
          "name": "damm_vault_a",
          "writable": true
        },
        {
          "name": "damm_vault_b",
          "writable": true
        },
        {
          "name": "quote_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "authority_base",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "fee_buffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "quote_token_program"
              },
              {
                "kind": "account",
                "path": "quote_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "stake_pool",
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "holder_rewards",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "pvp_token",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  118,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "reward_vault",
          "writable": true
        },
        {
          "name": "team_wsol",
          "writable": true
        },
        {
          "name": "pvp_stake_pool"
        },
        {
          "name": "pvp_reward_vault",
          "writable": true
        },
        {
          "name": "damm_pool_authority"
        },
        {
          "name": "damm_event_authority"
        },
        {
          "name": "cp_amm_program",
          "address": "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "quote_token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claim_rewards",
      "discriminator": [
        4,
        144,
        132,
        71,
        116,
        23,
        151,
        80
      ],
      "accounts": [
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "stake_pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_pool.stake_mint",
                "account": "StakePool"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_pool.stake_mint",
                "account": "StakePool"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "reward_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "user_wsol",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "complete_unstake",
      "discriminator": [
        79,
        98,
        40,
        241,
        100,
        30,
        25,
        234
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stake_pool",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              }
            ]
          }
        },
        {
          "name": "unstake_request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "stake_mint",
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "user_stake_ata",
          "writable": true
        },
        {
          "name": "stake_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "stake_token_program"
        }
      ],
      "args": []
    },
    {
      "name": "create_proposal",
      "discriminator": [
        132,
        116,
        68,
        174,
        216,
        160,
        198,
        22
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "curve.proposal_count",
                "account": "Curve"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "proposer_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "proposer"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vote_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "proposer"
              }
            ]
          }
        },
        {
          "name": "name_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "blocked",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "blocked_symbol"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name_key",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "create_token",
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "dbc_settings",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  98,
                  99
                ]
              }
            ]
          }
        },
        {
          "name": "dbc_config"
        },
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "quote_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "dbc_pool",
          "writable": true
        },
        {
          "name": "base_vault",
          "writable": true
        },
        {
          "name": "quote_vault",
          "writable": true
        },
        {
          "name": "curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "name_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "blocked",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "blocked_symbol"
        },
        {
          "name": "dbc_pool_authority"
        },
        {
          "name": "dbc_event_authority"
        },
        {
          "name": "dbc_program",
          "address": "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "quote_token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name_key",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "execute_proposal",
      "discriminator": [
        186,
        60,
        116,
        133,
        108,
        128,
        111,
        28
      ],
      "accounts": [
        {
          "name": "executor",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "relations": [
            "curve",
            "proposal"
          ]
        },
        {
          "name": "curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "proposal.id",
                "account": "Proposal"
              }
            ]
          }
        },
        {
          "name": "name_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal.name_key",
                "account": "Proposal"
              }
            ]
          }
        },
        {
          "name": "old_name_record",
          "writable": true
        },
        {
          "name": "blocked",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "proposal.name_key",
                "account": "Proposal"
              }
            ]
          }
        },
        {
          "name": "proposer",
          "writable": true
        },
        {
          "name": "fee_recipient",
          "writable": true
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "init_holder_rewards",
      "discriminator": [
        113,
        195,
        34,
        233,
        113,
        160,
        71,
        64
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "curve",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "holder_rewards",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "wsol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "holder_rewards"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "init_stake_pool",
      "discriminator": [
        145,
        69,
        167,
        211,
        154,
        130,
        73,
        50
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "pvp_token",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  118,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "stake_mint"
        },
        {
          "name": "stake_pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              }
            ]
          }
        },
        {
          "name": "stake_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "stake_pool"
              },
              {
                "kind": "account",
                "path": "stake_token_program"
              },
              {
                "kind": "account",
                "path": "stake_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "wsol_mint",
          "address": "So11111111111111111111111111111111111111112"
        },
        {
          "name": "reward_vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "stake_pool"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "wsol_mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "stake_token_program"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize_config",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "program",
          "address": "4716RUH7qqikpxf6sQAp33xUaJMBD3y6QeAnndH4iV3M"
        },
        {
          "name": "program_data"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "ConfigParams"
            }
          }
        }
      ]
    },
    {
      "name": "request_unstake",
      "discriminator": [
        44,
        154,
        110,
        253,
        160,
        202,
        54,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stake_pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_pool.stake_mint",
                "account": "StakePool"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_pool.stake_mint",
                "account": "StakePool"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "unstake_request",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_pool.stake_mint",
                "account": "StakePool"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "reward_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "set_admin",
      "discriminator": [
        251,
        163,
        0,
        52,
        91,
        194,
        187,
        92
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "new_admin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_dbc_config",
      "discriminator": [
        25,
        247,
        220,
        155,
        180,
        243,
        152,
        56
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "dbc_config"
        },
        {
          "name": "dbc_settings",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  98,
                  99
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "set_fee_recipient",
      "discriminator": [
        227,
        18,
        215,
        42,
        237,
        246,
        151,
        66
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "fee_recipient",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_fees",
      "discriminator": [
        137,
        178,
        49,
        58,
        0,
        245,
        242,
        190
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "fee_bps",
          "type": "u16"
        },
        {
          "name": "holder_fee_bps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "set_governance",
      "discriminator": [
        34,
        71,
        128,
        245,
        179,
        42,
        140,
        137
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "reward_duration",
          "type": "i64"
        },
        {
          "name": "proposal_bond",
          "type": "i64"
        },
        {
          "name": "execution_fee",
          "type": "i64"
        }
      ]
    },
    {
      "name": "set_operator",
      "discriminator": [
        238,
        153,
        101,
        169,
        243,
        131,
        36,
        1
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "operator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_pvp_token",
      "discriminator": [
        70,
        253,
        229,
        101,
        43,
        247,
        53,
        121
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "pvp_token",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  118,
                  112,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_rewards_authority",
      "discriminator": [
        158,
        155,
        197,
        39,
        41,
        103,
        164,
        179
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "rewards_authority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_rewards_root",
      "discriminator": [
        126,
        220,
        20,
        69,
        189,
        48,
        98,
        60
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "rewards_authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "holder_rewards",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "holder_rewards.mint",
                "account": "HolderRewards"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "total",
          "type": "u64"
        }
      ]
    },
    {
      "name": "set_staking",
      "discriminator": [
        235,
        40,
        193,
        170,
        11,
        4,
        167,
        122
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "staker_bps",
          "type": "u16"
        },
        {
          "name": "stake_cooldown",
          "type": "i64"
        }
      ]
    },
    {
      "name": "set_vote_rules",
      "discriminator": [
        197,
        80,
        89,
        5,
        252,
        254,
        84,
        134
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "proposal_threshold_bps",
          "type": "u16"
        },
        {
          "name": "quorum_bps",
          "type": "u16"
        },
        {
          "name": "vote_duration",
          "type": "i64"
        },
        {
          "name": "vote_rename_cooldown",
          "type": "i64"
        }
      ]
    },
    {
      "name": "stake",
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stake_pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "stake_mint",
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "user_stake_ata",
          "writable": true
        },
        {
          "name": "stake_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "reward_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "stake_token_program"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sweep_fee_buffer",
      "discriminator": [
        20,
        118,
        26,
        62,
        45,
        111,
        20,
        29
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "fee_buffer",
          "writable": true
        },
        {
          "name": "team_wsol",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "sync_rewards",
      "discriminator": [
        18,
        47,
        240,
        255,
        79,
        191,
        165,
        54
      ],
      "accounts": [
        {
          "name": "stake_pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_pool.stake_mint",
                "account": "StakePool"
              }
            ]
          }
        },
        {
          "name": "reward_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "team_create_proposal",
      "discriminator": [
        133,
        176,
        188,
        1,
        73,
        69,
        201,
        79
      ],
      "accounts": [
        {
          "name": "team",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "operator",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "curve"
          ]
        },
        {
          "name": "curve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "curve.proposal_count",
                "account": "Curve"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "name_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "blocked",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        },
        {
          "name": "blocked_symbol"
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associated_token_program",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "name_key",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "unblock_name",
      "discriminator": [
        35,
        233,
        180,
        65,
        130,
        0,
        66,
        108
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "blocked",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  108,
                  111,
                  99,
                  107,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "name_key"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "_name_key",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "unstake",
      "discriminator": [
        90,
        95,
        107,
        42,
        205,
        124,
        50,
        225
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "stake_pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              }
            ]
          }
        },
        {
          "name": "stake_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  107,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "stake_mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "stake_mint",
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "user_stake_ata",
          "writable": true
        },
        {
          "name": "stake_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "reward_vault",
          "writable": true,
          "relations": [
            "stake_pool"
          ]
        },
        {
          "name": "stake_token_program"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "relations": [
            "proposal"
          ]
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "proposal.id",
                "account": "Proposal"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "voter_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "voter"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vote_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "yes",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true,
          "relations": [
            "vote_record"
          ]
        },
        {
          "name": "mint",
          "relations": [
            "proposal"
          ]
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "proposal.id",
                "account": "Proposal"
              }
            ]
          },
          "relations": [
            "vote_record"
          ]
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "voter_ata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "voter"
              },
              {
                "kind": "account",
                "path": "token_program"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vote_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "BlockedName",
      "discriminator": [
        170,
        240,
        133,
        71,
        251,
        178,
        120,
        207
      ]
    },
    {
      "name": "Config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "Curve",
      "discriminator": [
        191,
        180,
        249,
        66,
        180,
        71,
        51,
        182
      ]
    },
    {
      "name": "DbcSettings",
      "discriminator": [
        245,
        92,
        20,
        161,
        156,
        82,
        128,
        22
      ]
    },
    {
      "name": "HolderRewards",
      "discriminator": [
        54,
        239,
        47,
        138,
        212,
        139,
        61,
        97
      ]
    },
    {
      "name": "NameRecord",
      "discriminator": [
        254,
        22,
        17,
        161,
        229,
        49,
        238,
        105
      ]
    },
    {
      "name": "Operator",
      "discriminator": [
        219,
        31,
        188,
        145,
        69,
        139,
        204,
        117
      ]
    },
    {
      "name": "Pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "PoolConfig",
      "discriminator": [
        26,
        108,
        14,
        123,
        116,
        230,
        129,
        43
      ]
    },
    {
      "name": "Proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    },
    {
      "name": "PvpToken",
      "discriminator": [
        84,
        218,
        1,
        205,
        249,
        150,
        83,
        88
      ]
    },
    {
      "name": "RewardClaim",
      "discriminator": [
        194,
        80,
        130,
        80,
        113,
        62,
        2,
        91
      ]
    },
    {
      "name": "RewardsAuthority",
      "discriminator": [
        172,
        43,
        51,
        207,
        42,
        174,
        250,
        78
      ]
    },
    {
      "name": "StakeAccount",
      "discriminator": [
        80,
        158,
        67,
        124,
        50,
        189,
        192,
        255
      ]
    },
    {
      "name": "StakePool",
      "discriminator": [
        121,
        34,
        206,
        21,
        79,
        127,
        255,
        28
      ]
    },
    {
      "name": "UnstakeRequest",
      "discriminator": [
        127,
        34,
        23,
        191,
        211,
        254,
        202,
        42
      ]
    },
    {
      "name": "VoteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    }
  ],
  "events": [
    {
      "name": "FeesClaimed",
      "discriminator": [
        22,
        104,
        110,
        222,
        38,
        157,
        14,
        62
      ]
    },
    {
      "name": "HolderRewardsClaimed",
      "discriminator": [
        60,
        184,
        143,
        130,
        179,
        103,
        55,
        178
      ]
    },
    {
      "name": "ProposalCreated",
      "discriminator": [
        186,
        8,
        160,
        108,
        81,
        13,
        51,
        206
      ]
    },
    {
      "name": "ProposalSettled",
      "discriminator": [
        135,
        138,
        207,
        78,
        188,
        208,
        210,
        132
      ]
    },
    {
      "name": "Renamed",
      "discriminator": [
        148,
        232,
        32,
        179,
        231,
        9,
        232,
        103
      ]
    },
    {
      "name": "RewardsRootSet",
      "discriminator": [
        90,
        180,
        11,
        35,
        81,
        49,
        74,
        87
      ]
    },
    {
      "name": "TokenCreated",
      "discriminator": [
        236,
        19,
        41,
        255,
        130,
        78,
        147,
        172
      ]
    },
    {
      "name": "UnstakeCompleted",
      "discriminator": [
        168,
        210,
        26,
        167,
        221,
        114,
        99,
        125
      ]
    },
    {
      "name": "UnstakeRequested",
      "discriminator": [
        21,
        253,
        177,
        85,
        129,
        206,
        42,
        152
      ]
    },
    {
      "name": "VoteWithdrawn",
      "discriminator": [
        124,
        163,
        22,
        0,
        175,
        223,
        243,
        20
      ]
    },
    {
      "name": "Voted",
      "discriminator": [
        189,
        74,
        101,
        127,
        109,
        214,
        95,
        130
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmptyName",
      "msg": "Name must have at least one letter or number"
    },
    {
      "code": 6001,
      "name": "TooLong",
      "msg": "Name, ticker or image link is too long"
    },
    {
      "code": 6002,
      "name": "NameKeyMismatch",
      "msg": "Name key does not match the name"
    },
    {
      "code": 6003,
      "name": "NameBlocked",
      "msg": "This name belongs to a major brand or token"
    },
    {
      "code": 6004,
      "name": "NameLocked",
      "msg": "Another token holds this name for now"
    },
    {
      "code": 6005,
      "name": "NothingToChange",
      "msg": "Nothing to change"
    },
    {
      "code": 6006,
      "name": "CurveComplete",
      "msg": "The bonding curve is complete"
    },
    {
      "code": 6007,
      "name": "ZeroAmount",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6008,
      "name": "Slippage",
      "msg": "Price moved past your slippage limit"
    },
    {
      "code": 6009,
      "name": "InvalidConfig",
      "msg": "Invalid config"
    },
    {
      "code": 6010,
      "name": "Overflow",
      "msg": "Math overflow"
    },
    {
      "code": 6011,
      "name": "ProposalActive",
      "msg": "This token already has an open rename vote"
    },
    {
      "code": 6012,
      "name": "BelowProposalThreshold",
      "msg": "Lock more coins to open a rename vote"
    },
    {
      "code": 6013,
      "name": "VotingEnded",
      "msg": "Voting on this proposal has ended"
    },
    {
      "code": 6014,
      "name": "VotingOpen",
      "msg": "Voting on this proposal is still open"
    },
    {
      "code": 6015,
      "name": "AlreadyExecuted",
      "msg": "This proposal was already settled"
    },
    {
      "code": 6016,
      "name": "SwitchSide",
      "msg": "You already voted the other way; withdraw first to switch"
    },
    {
      "code": 6017,
      "name": "NothingToWithdraw",
      "msg": "Nothing to withdraw"
    },
    {
      "code": 6018,
      "name": "NotComplete",
      "msg": "The bonding curve is not complete yet"
    },
    {
      "code": 6019,
      "name": "AlreadyMigrated",
      "msg": "Liquidity already moved to Meteora"
    },
    {
      "code": 6020,
      "name": "BadPoolPrice",
      "msg": "Pool price does not match the curve reserves"
    },
    {
      "code": 6021,
      "name": "MigrationLeftover",
      "msg": "Too much of the reserves was left out of the pool"
    },
    {
      "code": 6022,
      "name": "NotMigrated",
      "msg": "This needs the liquidity on Meteora first"
    },
    {
      "code": 6023,
      "name": "InvalidRoute",
      "msg": "The swap pool does not trade the current pair against the new one"
    },
    {
      "code": 6024,
      "name": "WrongProposalKind",
      "msg": "Wrong proposal type for this instruction"
    },
    {
      "code": 6025,
      "name": "RotationActive",
      "msg": "A pair rotation is already in progress"
    },
    {
      "code": 6026,
      "name": "NoRotation",
      "msg": "No pair rotation in progress"
    },
    {
      "code": 6027,
      "name": "RotationNotDue",
      "msg": "The next rotation step is not due yet"
    },
    {
      "code": 6028,
      "name": "RotationPhase",
      "msg": "This rotation step is in the wrong phase"
    },
    {
      "code": 6029,
      "name": "NothingToClaim",
      "msg": "Nothing to claim"
    },
    {
      "code": 6030,
      "name": "InsufficientStake",
      "msg": "Not enough staked"
    },
    {
      "code": 6031,
      "name": "WrongFeeDestination",
      "msg": "Pool fees in SOL must go to the holder rewards vault"
    },
    {
      "code": 6032,
      "name": "ProposerLocked",
      "msg": "The proposer's coins stay locked until the vote ends"
    },
    {
      "code": 6033,
      "name": "PoolNotTaken",
      "msg": "The Meteora pool for this pair does not exist, so the migration can still happen"
    },
    {
      "code": 6034,
      "name": "DepositMustFollow",
      "msg": "The rotation deposit must come right after the withdrawal, in the same transaction"
    },
    {
      "code": 6035,
      "name": "TickerBlocked",
      "msg": "This ticker belongs to a major brand or token"
    },
    {
      "code": 6036,
      "name": "NotSolPair",
      "msg": "Pool fees can only be split while the pair is SOL"
    },
    {
      "code": 6037,
      "name": "VoteCooldown",
      "msg": "This token changed its name by vote less than a day ago; wait to open a new vote"
    },
    {
      "code": 6038,
      "name": "NameChars",
      "msg": "Names and tickers can only use Latin letters, digits, and Chinese, Japanese or Korean characters"
    },
    {
      "code": 6039,
      "name": "NotOperator",
      "msg": "Only the PVP admin or operator can do this"
    },
    {
      "code": 6040,
      "name": "VotesLockedUntilEnd",
      "msg": "This vote was decided early; locked coins come back when its original voting time ends"
    },
    {
      "code": 6041,
      "name": "InvalidProof",
      "msg": "This rewards proof doesn't match the latest rewards root"
    },
    {
      "code": 6042,
      "name": "NotRewardsAuthority",
      "msg": "Only the PVP rewards authority can publish rewards"
    },
    {
      "code": 6043,
      "name": "InvalidRewardsRoot",
      "msg": "Rewards can't exceed what holders received, and can't go down"
    },
    {
      "code": 6044,
      "name": "StakeOnlyPvpToken",
      "msg": "Only the PVP token has staking; other tokens pay holders automatically"
    },
    {
      "code": 6045,
      "name": "WrongRewardsAccount",
      "msg": "Holder rewards for this token go to a different account"
    },
    {
      "code": 6046,
      "name": "EarlySettleNotAlone",
      "msg": "A vote decided early must be counted in its own transaction"
    },
    {
      "code": 6047,
      "name": "UnstakeNeedsRequest",
      "msg": "Unstaking has a waiting period: request the unstake, then complete it when the wait is over"
    },
    {
      "code": 6048,
      "name": "UnstakeLocked",
      "msg": "The unstake waiting period is not over yet"
    },
    {
      "code": 6049,
      "name": "TransferHookNotSupported",
      "msg": "Tokens with a transfer hook can't be staked"
    }
  ],
  "types": [
    {
      "name": "BaseFeeConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cliff_fee_numerator",
            "type": "u64"
          },
          {
            "name": "second_factor",
            "type": "u64"
          },
          {
            "name": "third_factor",
            "type": "u64"
          },
          {
            "name": "first_factor",
            "type": "u16"
          },
          {
            "name": "base_fee_mode",
            "type": "u8"
          },
          {
            "name": "padding_0",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "BaseFeeInfo",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "BaseFeeStruct",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base_fee_info",
            "type": {
              "defined": {
                "name": "BaseFeeInfo"
              }
            }
          },
          {
            "name": "padding_1",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "BlockedName",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "fee_bps",
            "type": "u16"
          },
          {
            "name": "holder_fee_bps",
            "type": "u16"
          },
          {
            "name": "execution_fee",
            "type": "i64"
          },
          {
            "name": "name_lock",
            "type": "i64"
          },
          {
            "name": "initial_virtual_sol",
            "type": "u64"
          },
          {
            "name": "initial_virtual_tokens",
            "type": "u64"
          },
          {
            "name": "tokens_for_sale",
            "type": "u64"
          },
          {
            "name": "total_supply",
            "type": "u64"
          },
          {
            "name": "proposal_threshold_bps",
            "type": "u16"
          },
          {
            "name": "quorum_bps",
            "type": "u16"
          },
          {
            "name": "vote_duration",
            "type": "i64"
          },
          {
            "name": "vote_rename_cooldown",
            "type": "i64"
          },
          {
            "name": "stake_cooldown",
            "type": "i64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                19
              ]
            }
          },
          {
            "name": "reward_duration",
            "type": "i64"
          },
          {
            "name": "rotation_steps",
            "type": "u8"
          },
          {
            "name": "proposal_bond",
            "type": "i64"
          },
          {
            "name": "staker_bps",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fee_recipient",
            "type": "pubkey"
          },
          {
            "name": "fee_bps",
            "type": "u16"
          },
          {
            "name": "holder_fee_bps",
            "type": "u16"
          },
          {
            "name": "execution_fee",
            "type": "i64"
          },
          {
            "name": "name_lock",
            "type": "i64"
          },
          {
            "name": "initial_virtual_sol",
            "type": "u64"
          },
          {
            "name": "initial_virtual_tokens",
            "type": "u64"
          },
          {
            "name": "tokens_for_sale",
            "type": "u64"
          },
          {
            "name": "total_supply",
            "type": "u64"
          },
          {
            "name": "proposal_threshold_bps",
            "type": "u16"
          },
          {
            "name": "quorum_bps",
            "type": "u16"
          },
          {
            "name": "vote_duration",
            "type": "i64"
          },
          {
            "name": "vote_rename_cooldown",
            "type": "i64"
          },
          {
            "name": "stake_cooldown",
            "type": "i64"
          },
          {
            "name": "reward_duration",
            "type": "i64"
          },
          {
            "name": "rotation_steps",
            "type": "u8"
          },
          {
            "name": "proposal_bond",
            "type": "i64"
          },
          {
            "name": "staker_bps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "Curve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "dbc_pool",
            "type": "pubkey"
          },
          {
            "name": "dbc_config",
            "type": "pubkey"
          },
          {
            "name": "created_at",
            "type": "i64"
          },
          {
            "name": "last_rename_at",
            "type": "i64"
          },
          {
            "name": "last_vote_rename_at",
            "type": "i64"
          },
          {
            "name": "rename_count",
            "type": "u32"
          },
          {
            "name": "name_key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "proposal_count",
            "type": "u32"
          },
          {
            "name": "active_proposal",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "DbcSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dbc_config",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "DynamicFeeConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "max_volatility_accumulator",
            "type": "u32"
          },
          {
            "name": "variable_fee_control",
            "type": "u32"
          },
          {
            "name": "bin_step",
            "type": "u16"
          },
          {
            "name": "filter_period",
            "type": "u16"
          },
          {
            "name": "decay_period",
            "type": "u16"
          },
          {
            "name": "reduction_factor",
            "type": "u16"
          },
          {
            "name": "padding2",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "bin_step_u128",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "DynamicFeeStruct",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "max_volatility_accumulator",
            "type": "u32"
          },
          {
            "name": "variable_fee_control",
            "type": "u32"
          },
          {
            "name": "bin_step",
            "type": "u16"
          },
          {
            "name": "filter_period",
            "type": "u16"
          },
          {
            "name": "decay_period",
            "type": "u16"
          },
          {
            "name": "reduction_factor",
            "type": "u16"
          },
          {
            "name": "last_update_timestamp",
            "type": "u64"
          },
          {
            "name": "bin_step_u128",
            "type": "u128"
          },
          {
            "name": "sqrt_price_reference",
            "type": "u128"
          },
          {
            "name": "volatility_accumulator",
            "type": "u128"
          },
          {
            "name": "volatility_reference",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "FeeSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Curve"
          },
          {
            "name": "Pool"
          },
          {
            "name": "Surplus"
          }
        ]
      }
    },
    {
      "name": "FeesClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "source",
            "type": {
              "defined": {
                "name": "FeeSource"
              }
            }
          },
          {
            "name": "total",
            "type": "u64"
          },
          {
            "name": "holders",
            "type": "u64"
          },
          {
            "name": "stakers",
            "type": "u64"
          },
          {
            "name": "team",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "HolderRewards",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "total_received",
            "type": "u64"
          },
          {
            "name": "total_claimed",
            "type": "u64"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "root_total",
            "type": "u64"
          },
          {
            "name": "root_seq",
            "type": "u64"
          },
          {
            "name": "updated_at",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "HolderRewardsClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "cumulative",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "LiquidityDistributionConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sqrt_price",
            "type": "u128"
          },
          {
            "name": "liquidity",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "LiquidityVestingInfo",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "is_initialized",
            "type": "u8"
          },
          {
            "name": "vesting_percentage",
            "type": "u8"
          },
          {
            "name": "_padding",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "bps_per_period",
            "type": "u16"
          },
          {
            "name": "number_of_periods",
            "type": "u16"
          },
          {
            "name": "frequency",
            "type": "u32"
          },
          {
            "name": "cliff_duration_from_migration_time",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "LockedVestingConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount_per_period",
            "type": "u64"
          },
          {
            "name": "cliff_duration_from_migration_time",
            "type": "u64"
          },
          {
            "name": "frequency",
            "type": "u64"
          },
          {
            "name": "number_of_period",
            "type": "u64"
          },
          {
            "name": "cliff_unlock_amount",
            "type": "u64"
          },
          {
            "name": "_padding",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "NameRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "since",
            "type": "i64"
          },
          {
            "name": "reserved_for",
            "type": "pubkey"
          },
          {
            "name": "reserved_until",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Operator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Pool",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool_fees",
            "type": {
              "defined": {
                "name": "PoolFeesStruct"
              }
            }
          },
          {
            "name": "token_a_mint",
            "type": "pubkey"
          },
          {
            "name": "token_b_mint",
            "type": "pubkey"
          },
          {
            "name": "token_a_vault",
            "type": "pubkey"
          },
          {
            "name": "token_b_vault",
            "type": "pubkey"
          },
          {
            "name": "whitelisted_vault",
            "type": "pubkey"
          },
          {
            "name": "padding_0",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "padding_1",
            "type": "u128"
          },
          {
            "name": "protocol_a_fee",
            "type": "u64"
          },
          {
            "name": "protocol_b_fee",
            "type": "u64"
          },
          {
            "name": "dead_liquidity_fee_checkpoint",
            "type": "u64"
          },
          {
            "name": "padding_2",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "sqrt_min_price",
            "type": "u128"
          },
          {
            "name": "sqrt_max_price",
            "type": "u128"
          },
          {
            "name": "sqrt_price",
            "type": "u128"
          },
          {
            "name": "activation_point",
            "type": "u64"
          },
          {
            "name": "activation_type",
            "type": "u8"
          },
          {
            "name": "pool_status",
            "type": "u8"
          },
          {
            "name": "token_a_flag",
            "type": "u8"
          },
          {
            "name": "token_b_flag",
            "type": "u8"
          },
          {
            "name": "collect_fee_mode",
            "type": "u8"
          },
          {
            "name": "pool_type",
            "type": "u8"
          },
          {
            "name": "fee_version",
            "type": "u8"
          },
          {
            "name": "padding_3",
            "type": "u8"
          },
          {
            "name": "fee_a_per_liquidity",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "fee_b_per_liquidity",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "permanent_lock_liquidity",
            "type": "u128"
          },
          {
            "name": "metrics",
            "type": {
              "defined": {
                "name": "PoolMetrics"
              }
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "token_a_amount",
            "type": "u64"
          },
          {
            "name": "token_b_amount",
            "type": "u64"
          },
          {
            "name": "layout_version",
            "type": "u8"
          },
          {
            "name": "padding_4",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "padding_5",
            "type": {
              "array": [
                "u64",
                3
              ]
            }
          },
          {
            "name": "reward_infos",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "RewardInfo"
                  }
                },
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "PoolConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "fee_claimer",
            "type": "pubkey"
          },
          {
            "name": "leftover_receiver",
            "type": "pubkey"
          },
          {
            "name": "pool_fees",
            "type": {
              "defined": {
                "name": "PoolFeesConfig"
              }
            }
          },
          {
            "name": "partner_liquidity_vesting_info",
            "type": {
              "defined": {
                "name": "LiquidityVestingInfo"
              }
            }
          },
          {
            "name": "creator_liquidity_vesting_info",
            "type": {
              "defined": {
                "name": "LiquidityVestingInfo"
              }
            }
          },
          {
            "name": "padding_0",
            "type": {
              "array": [
                "u8",
                14
              ]
            }
          },
          {
            "name": "padding_1",
            "type": "u16"
          },
          {
            "name": "collect_fee_mode",
            "type": "u8"
          },
          {
            "name": "migration_option",
            "type": "u8"
          },
          {
            "name": "activation_type",
            "type": "u8"
          },
          {
            "name": "token_decimal",
            "type": "u8"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "token_type",
            "type": "u8"
          },
          {
            "name": "quote_token_flag",
            "type": "u8"
          },
          {
            "name": "partner_permanent_locked_liquidity_percentage",
            "type": "u8"
          },
          {
            "name": "partner_liquidity_percentage",
            "type": "u8"
          },
          {
            "name": "creator_permanent_locked_liquidity_percentage",
            "type": "u8"
          },
          {
            "name": "creator_liquidity_percentage",
            "type": "u8"
          },
          {
            "name": "migration_fee_option",
            "type": "u8"
          },
          {
            "name": "fixed_token_supply_flag",
            "type": "u8"
          },
          {
            "name": "creator_trading_fee_percentage",
            "type": "u8"
          },
          {
            "name": "token_update_authority",
            "type": "u8"
          },
          {
            "name": "migration_fee_percentage",
            "type": "u8"
          },
          {
            "name": "creator_migration_fee_percentage",
            "type": "u8"
          },
          {
            "name": "padding_2",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "swap_base_amount",
            "type": "u64"
          },
          {
            "name": "migration_quote_threshold",
            "type": "u64"
          },
          {
            "name": "migration_base_threshold",
            "type": "u64"
          },
          {
            "name": "migration_sqrt_price",
            "type": "u128"
          },
          {
            "name": "locked_vesting_config",
            "type": {
              "defined": {
                "name": "LockedVestingConfig"
              }
            }
          },
          {
            "name": "pre_migration_token_supply",
            "type": "u64"
          },
          {
            "name": "post_migration_token_supply",
            "type": "u64"
          },
          {
            "name": "migrated_collect_fee_mode",
            "type": "u8"
          },
          {
            "name": "migrated_dynamic_fee",
            "type": "u8"
          },
          {
            "name": "migrated_pool_fee_bps",
            "type": "u16"
          },
          {
            "name": "migrated_pool_base_fee_mode",
            "type": "u8"
          },
          {
            "name": "enable_first_swap_with_min_fee",
            "type": "u8"
          },
          {
            "name": "migrated_compounding_fee_bps",
            "type": "u16"
          },
          {
            "name": "pool_creation_fee",
            "type": "u64"
          },
          {
            "name": "migrated_pool_base_fee_bytes",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "sqrt_start_price",
            "type": "u128"
          },
          {
            "name": "curve",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "LiquidityDistributionConfig"
                  }
                },
                20
              ]
            }
          }
        ]
      }
    },
    {
      "name": "PoolFeesConfig",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base_fee",
            "type": {
              "defined": {
                "name": "BaseFeeConfig"
              }
            }
          },
          {
            "name": "dynamic_fee",
            "type": {
              "defined": {
                "name": "DynamicFeeConfig"
              }
            }
          }
        ]
      }
    },
    {
      "name": "PoolFeesStruct",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base_fee",
            "type": {
              "defined": {
                "name": "BaseFeeStruct"
              }
            }
          },
          {
            "name": "protocol_fee_percent",
            "type": "u8"
          },
          {
            "name": "padding_0",
            "type": "u8"
          },
          {
            "name": "referral_fee_percent",
            "type": "u8"
          },
          {
            "name": "padding_1",
            "type": {
              "array": [
                "u8",
                3
              ]
            }
          },
          {
            "name": "compounding_fee_bps",
            "type": "u16"
          },
          {
            "name": "dynamic_fee",
            "type": {
              "defined": {
                "name": "DynamicFeeStruct"
              }
            }
          },
          {
            "name": "init_sqrt_price",
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "PoolMetrics",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "total_lp_a_fee",
            "type": "u128"
          },
          {
            "name": "total_lp_b_fee",
            "type": "u128"
          },
          {
            "name": "total_protocol_a_fee",
            "type": "u64"
          },
          {
            "name": "total_protocol_b_fee",
            "type": "u64"
          },
          {
            "name": "padding_0",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "total_position",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "name_key",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "created_at",
            "type": "i64"
          },
          {
            "name": "ends_at",
            "type": "i64"
          },
          {
            "name": "yes",
            "type": "u64"
          },
          {
            "name": "no",
            "type": "u64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "passed",
            "type": "bool"
          },
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "quote_mint",
            "type": "pubkey"
          },
          {
            "name": "route_pool",
            "type": "pubkey"
          },
          {
            "name": "bond",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ProposalCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "ends_at",
            "type": "i64"
          },
          {
            "name": "by_team",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "ProposalSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "passed",
            "type": "bool"
          },
          {
            "name": "yes",
            "type": "u64"
          },
          {
            "name": "no",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PvpToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RenameBy",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Dev"
          },
          {
            "name": "Vote"
          }
        ]
      }
    },
    {
      "name": "Renamed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "old_name",
            "type": "string"
          },
          {
            "name": "old_symbol",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "by",
            "type": {
              "defined": {
                "name": "RenameBy"
              }
            }
          },
          {
            "name": "at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "RewardClaim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimed",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RewardInfo",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "u8"
          },
          {
            "name": "reward_token_flag",
            "type": "u8"
          },
          {
            "name": "_padding_0",
            "type": {
              "array": [
                "u8",
                6
              ]
            }
          },
          {
            "name": "dead_liquidity_reward_checkpoint",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "reward_duration",
            "type": "u64"
          },
          {
            "name": "reward_duration_end",
            "type": "u64"
          },
          {
            "name": "reward_rate",
            "type": "u128"
          },
          {
            "name": "reward_per_token_stored",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "last_update_time",
            "type": "u64"
          },
          {
            "name": "cumulative_seconds_with_empty_liquidity_reward",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RewardsAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RewardsRootSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "total",
            "type": "u64"
          },
          {
            "name": "seq",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "StakeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "reward_debt",
            "type": "u128"
          },
          {
            "name": "pending",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "StakePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stake_mint",
            "type": "pubkey"
          },
          {
            "name": "stake_vault",
            "type": "pubkey"
          },
          {
            "name": "reward_vault",
            "type": "pubkey"
          },
          {
            "name": "total_staked",
            "type": "u64"
          },
          {
            "name": "acc_reward_per_share",
            "type": "u128"
          },
          {
            "name": "accounted_balance",
            "type": "u64"
          },
          {
            "name": "undistributed",
            "type": "u64"
          },
          {
            "name": "total_distributed",
            "type": "u64"
          },
          {
            "name": "reward_duration",
            "type": "i64"
          },
          {
            "name": "reward_rate",
            "type": "u128"
          },
          {
            "name": "period_finish",
            "type": "i64"
          },
          {
            "name": "last_update",
            "type": "i64"
          },
          {
            "name": "acc_remainder",
            "type": "u128"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "TokenCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UnstakeCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UnstakeRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "stake_mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "requested_at",
            "type": "i64"
          },
          {
            "name": "unlock_at",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UnstakeRequested",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "unlock_at",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "VoteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "yes",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "VoteWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "vote_cancelled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Voted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "yes",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
