scripts\code-map\config.ts

```
import type { Config } from "./_types";

export const config: Config = {
  ".git": "ignore",
  ".github": "error",
  ".husky": "ignore",
  ".next": "ignore",
  ".qodo": "ignore",
  context: "error",
  drizzle: "ignore",
  node_modules: "ignore",
  public: "ignore",
  scripts: "error",
  src: "error",
  ".dockerignore": "error",
  ".env.development": "error",
  ".gitattributes": "error",
  ".gitignore": "error",
  "biome.json": "error",
  "bun.lock": "error",
  "components.json": "error",
  "docker-compose.yml": "error",
  Dockerfile: "error",
  "drizzle.config.ts": "error",
  "next-env.d.ts": "ok",
  "next.config.ts": "error",
  "package.json": "error",
  "postcss.config.mjs": "ok",
  "tsconfig.json": "ok",
  "tsconfig.tsbuildinfo": "ignore",
} as const;

```

scripts\code-map\index.ts

```
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codeMap } from "./_core/code-map";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

codeMap({
  paths: {
    rootDir: resolve(__dirname, "../../"),
    cacheFile: resolve(__dirname, "./_cache/index.ts"),
    configFile: resolve(__dirname, "./config.ts"),
  },
  ignoredExtensions: ["svg", "png", "webp", "jpg", "jpeg"],
});

```

scripts\code-map\_cache\index.ts

```
import type { Cache } from "../_types";

export const cache: Cache = {
  ".dockerignore": {
    "hash": "db033154036a6f591dcabf0fb54ecb105efbc651256bbfb0a9a69a0dd8048c7e",
    "status": "error"
  },
  ".env.development": {
    "hash": "4d42c61b8ba69c4647fefed3aa5bd6a798f41153c3625487d7bc066ac715e570",
    "status": "error"
  },
  ".gitattributes": {
    "hash": "f2124d4dbc93b7eb92710e272837d6761a5f8bd519e6d31163c6856e15093a5e",
    "status": "error"
  },
  ".github": {
    "workflows": {
      "main-deploy.yml": {
        "hash": "79f83f1efff86f2199182eafe260eae7e7f015dbaca2a3d864236cb6c315ae7e",
        "status": "error"
      },
      "reusable-build-push-cleanup.yml": {
        "hash": "2d7a043007a42a59327822db674a2445c1664633d490b27b7dd15068df3d163b",
        "status": "error"
      },
      "reusable-deploy.yml": {
        "hash": "b665f34da3b7b246ed286fd3b19aa26a478918f5ad34e63c8336eb5151bad913",
        "status": "error"
      }
    }
  },
  ".gitignore": {
    "hash": "2bb0f1225c33edbc5405f42a28222af1a04d537e7a48c6b4b13d9c781a6db7bf",
    "status": "error"
  },
  "biome.json": {
    "hash": "049e3349463a0d182ffbccd40b1a277fa9d83b7dd16d9a63d28415e168e716ad",
    "status": "error"
  },
  "bun.lock": {
    "hash": "01602af3031b6ecd16df6fe9fa660d0a6816cf17dd72cc3fc1955cf9ad4b83be",
    "status": "error"
  },
  "components.json": {
    "hash": "2f97bcc26c51dc72963f8b3b1a7f1a0bb1b4f9c2dab8dc81e51f4e8f2fb8c4a3",
    "status": "error"
  },
  "context": {
    "code-map.md": {
      "hash": "ffb0c9939da69c74f35906662bc3bb89c43ea701c26b97293404c0f1360201fe",
      "status": "error"
    },
    "core.md": {
      "hash": "bb7c7d361269d2151418214cac2b256acec40287e9addeccc89a58beea29901f",
      "status": "error"
    },
    "docs": {
      "elysia-solidjs.md": {
        "hash": "e661b14fd3b7120bcc1aced0af253d27a625cd1c9545f5fb79ffa2a00a28543c",
        "status": "error"
      }
    },
    "promts": {
      "main.md": {
        "hash": "1238209bf4e313e12b9f595132da374e812f2c3f5088f58b023574163c620ce8",
        "status": "error"
      },
      "metrics copy.md": {
        "hash": "1604b7d997f65ae56a787e6426720f10c51c7b91250dd91c8ef3900d96f81ea8",
        "status": "error"
      },
      "metrics.md": {
        "hash": "0503cc779979b1867bde059bd7205cc72ba7ed991997e3d6ea558f46f76d9529",
        "status": "error"
      },
      "task.md": {
        "hash": "d3b8531b4f88f06b8ac42c24dbaec7480d3843f759637e1d99c6f8202c85fd44",
        "status": "error"
      },
      "картинки.md": {
        "hash": "beaebef2ad01b33b83f8c3c580ab17b14dd0c9893fb583e70946cae1c0dd2716",
        "status": "error"
      },
      "категории copy.md": {
        "hash": "df4c40fd887f13e96c54932f8802a4e4148bfd03e9743dfd5c8878c5903fad0b",
        "status": "error"
      },
      "категории.md": {
        "hash": "f9b17f2764106d34642ef8ebd1db4d2c1d1a0358f1db68c7831f9f09b571b1e5",
        "status": "error"
      }
    },
    "secrets": {
      "secrets.md": {
        "hash": "813367e6811335433cdf9ec9cd9f30c6653ff2d0835f73d5fae397ec01f675e9",
        "status": "error"
      }
    },
    "targets.ts": {
      "hash": "780e4f4acfa0021cb05c12c4899c438da8cad9c3955569e8e645142fbc0a0d2c",
      "status": "error"
    }
  },
  "docker-compose.yml": {
    "hash": "2910ae9df777f27069684408cc70b6d77a30c5fe3fd2622a125dc23df3be1ce0",
    "status": "error"
  },
  "Dockerfile": {
    "hash": "d19dbc846c9911add58301d73660a9cc22e05ee753e8e9c6a1d8fbab95c43175",
    "status": "error"
  },
  "drizzle.config.ts": {
    "hash": "c758067e5388f9979971bb2fb1e1ebfa9efe28ee0d352d9032a367c114a95a42",
    "status": "error"
  },
  "next-env.d.ts": {
    "hash": "7ad303e40d4fddf44f156129e397511953a71481c5cfd86b1862649aaaf240cc",
    "status": "ok"
  },
  "next.config.ts": {
    "hash": "496898063c834c666510bdb5bb472bcf08e01ca8eef297da101ad12680c8fc93",
    "status": "error"
  },
  "package.json": {
    "hash": "dcdb258fc3ccbda1d05b66a1b49a560fbf2b88ec7ca1a2a0385a8b1e524a1829",
    "status": "error"
  },
  "postcss.config.mjs": {
    "hash": "dfac7ac2d86d326a0e5adb024e7943c181393ed17a5fcb8f0315b24c7da6ddde",
    "status": "ok"
  },
  "scripts": {
    "code-map": {
      "config.ts": {
        "hash": "37fae421cfbfc9210f7ff583d5875f2f8846b1302b0407beff14a72a24e83c03",
        "status": "error"
      },
      "index.ts": {
        "hash": "14af170d4b08d4881ea69354f0d0f9dc4cc0a234ad89ec245b70468eb3f8b237",
        "status": "error"
      },
      "_cache": {
        "index.ts": {
          "hash": "145ae83b20c2946ff37c2ab534a5648d14a0bac1c36ce3b2a0cffac1424375e4",
          "status": "error"
        }
      },
      "_core": {
        "code-map.ts": {
          "hash": "10489a5dc3b585419c319760de7d9a0017960f9666f6383f2a334a7c56dbee9f",
          "status": "error"
        },
        "init.ts": {
          "hash": "681ec25f0071a3e6c5bec3dc9d3adc0b99df54cc107ffa153e0b2fb38aff4329",
          "status": "error"
        },
        "merge.ts": {
          "hash": "41cac7977e8731579b9375bb3a9403cc669a7bfe9d926d16ec0994f27ca98610",
          "status": "error"
        }
      },
      "_types": {
        "index.ts": {
          "hash": "dea2fdfe5920b14ba2334028698956e2091020b9cfd8415c6eabe070139d898d",
          "status": "error"
        }
      },
      "_utils": {
        "extension.ts": {
          "hash": "9ac0ddd292b86e24ca26e2f7359bb054c858b564516cc73ea513c3e9749ddc36",
          "status": "error"
        },
        "hash-file.ts": {
          "hash": "0de7c466fe116ccda355a662995af8a88313cb7e1e257f6735bbe57606c6932d",
          "status": "error"
        },
        "index.ts": {
          "hash": "0f23713d96bb167e8843ac736de2c8ea344348f99f124852fcf9aec976502b47",
          "status": "error"
        },
        "print.ts": {
          "hash": "5360e403d531313c658aedfcc6302448fca87deee661ca9a26305c353d09d105",
          "status": "error"
        },
        "save-files.ts": {
          "hash": "92f299543ddbf2d63cbd77b103f3079bd7a6fc818054385ad829a6a734863b9a",
          "status": "error"
        }
      }
    },
    "context-builder": {
      "build-context.ts": {
        "hash": "879061b396093fc97e3332558876b9d1919bf4a5e7ed48eed43dc63c348153be",
        "status": "error"
      },
      "index.ts": {
        "hash": "68172a891c810d371092264013fbde8b207a6cf370d6a54d397e04b0e7ef1677",
        "status": "error"
      },
      "types.ts": {
        "hash": "983672b82de60d4689258db383002288d0c99b110046bb37c418c960f24fcafd",
        "status": "error"
      },
      "utils.ts": {
        "hash": "d54cfa43d82ad064419d39de50cd65a552272388bf0c833c3a9b1a03d4b5af26",
        "status": "error"
      }
    },
    "wait-and-clean-drizzle.ts": {
      "hash": "ddde95ec8bdbb40638c44249c25fe17d9c0fb07881968db479d2584d39e5653d",
      "status": "error"
    }
  },
  "src": {
    "app": {
      "(shop)": {
        "layout.tsx": {
          "hash": "78ec5ee9029f35ca988821f483a712ced828f5347718cac11b6453cf70b4f8e1",
          "status": "error"
        },
        "page.tsx": {
          "hash": "28063ff7bd1776aa2ae43c5470f391384dab015bad34c8884b84b29e64c6314c",
          "status": "error"
        }
      },
      "admin": {
        "brands": {
          "page.tsx": {
            "hash": "34839b75175e00eb27b9e49062b12b5f98194577e91166414270cf3bab5f1e20",
            "status": "error"
          }
        },
        "categories": {
          "page.tsx": {
            "hash": "598375d888b1256d9cc5321499c63843250efed7bf1d9d486453d1b2b825f440",
            "status": "error"
          }
        },
        "layout.tsx": {
          "hash": "de5238bd6cd0c7fe89ee19302fa5b56f88ff424985fef28260b870c2c1b33ad0",
          "status": "error"
        },
        "page.tsx": {
          "hash": "1b8bcb359c9b6f7ff142ca4d34b23b03530508f13fd02a91e14e920e70fa2f21",
          "status": "error"
        }
      },
      "api": {
        "auth": {
          "[...nextauth]": {
            "route.ts": {
              "hash": "77be94139ebdc167831d2394b7151c829596bf3079b7f6e09e901ba908cd0ac6",
              "status": "error"
            }
          }
        },
        "health": {
          "db": {
            "route.ts": {
              "hash": "3d08f51ba17078af11fc9bb774526459d62b937c7ff93e277cc5b39ff83e1ea5",
              "status": "error"
            }
          },
          "route.ts": {
            "hash": "f479da81e67789f1aa58872b54f89a57784e0c7fb4022855060e9173f9f170bb",
            "status": "error"
          }
        }
      },
      "layout.tsx": {
        "hash": "9689fea734e3a6bbda3a0c350171d3ce109467066720fc89e712a030fc55d74d",
        "status": "error"
      },
      "login": {
        "page.tsx": {
          "hash": "d127213e50f5a8ec24d9140cc41011c4f4812bb31163879da9566b48a1b390cc",
          "status": "error"
        },
        "_ui": {
          "login-page-content.tsx": {
            "hash": "989b7d0822a1f5bcfc731d14cd82adf7b3285f792a94930e7e14ae08893eef9f",
            "status": "error"
          }
        }
      },
      "not-found.tsx": {
        "hash": "603d5ceb54cc91c11d6bee19979c1c4913cbda191f6a3e04e6212de51f647311",
        "status": "error"
      },
      "_styles": {
        "globals.css": {
          "hash": "5542ca958686f613d2818364fa945068536730b473938fa4d5c0260f9706de3e",
          "status": "error"
        }
      },
      "_types": {
        "index.d.ts": {
          "hash": "35d26ea66c86da9701e4f4b467913481ffeae910761cea34c775c5dacb7f8eaa",
          "status": "error"
        },
        "next-auth.d.ts": {
          "hash": "c37cd44adb00fe1f1497f10a2840eacadf166c2563c4fc4f5e4906241cb6200a",
          "status": "error"
        }
      }
    },
    "features": {
      "categories": {
        "index.ts": {
          "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          "status": "error"
        },
        "server.ts": {
          "hash": "ffe355e5c0788c7dcc4f51a8ce6e7d7e469ca5fa7a4cf0dd06e5719079ba7dd5",
          "status": "error"
        },
        "_actions": {
          "create.ts": {
            "hash": "ad4811573d44dfdcbbeb87bf1e087a43ffb4a6c11616f84f2f22c1259cd488e1",
            "status": "error"
          },
          "delete.ts": {
            "hash": "26259c2cd143a41f6641c7162779658c44bcd6e1cf0b48e2e1bb82c9bb678401",
            "status": "error"
          },
          "read.ts": {
            "hash": "f825b11c95c9ac7a8152ea0877c01f22f786a767d456c636d61377231f2c335b",
            "status": "error"
          },
          "update.ts": {
            "hash": "484cfc020d8b214a3b32da3efa2891a16d7a9144115bbe6c910756a6b1736a05",
            "status": "error"
          }
        },
        "_lib": {
          "build-category-tree.ts": {
            "hash": "33a066313b4cdda96a27f7ff7323f66d94d79545f3bd6a7b5a99a428455f6143",
            "status": "error"
          }
        },
        "_ui": {
          "category-create-dialog.tsx": {
            "hash": "11a7fda9f9e4797056ac3b21cca7dad2ff47feba64253de7ec3ede1dbecbaf1b",
            "status": "error"
          },
          "category-edit-dialog.tsx": {
            "hash": "9393580fb46a9798b98169b1f69337e0aaccccbd613adca3d2c144eab5f6b335",
            "status": "error"
          },
          "filters.tsx": {
            "hash": "4f88206c8ef05b18357f7022cb968c831c72934f5c7054a1e1493aad40826cc1",
            "status": "error"
          },
          "manager.tsx": {
            "hash": "9d1fb675bee6a3b5088f81215788662a73f1cc07ddbcd70596a73ef3bf22aebc",
            "status": "error"
          },
          "page.tsx": {
            "hash": "b8b07286b508783ddb6430e34f548b4d7557f1dd664feb746555ec7959deed02",
            "status": "error"
          },
          "table.tsx": {
            "hash": "379cd305969b3b4f86b00b3cb7e762acdb58b214048c283bda7cd64fe5e59b59",
            "status": "error"
          },
          "test-categories.tsx": {
            "hash": "7cc7c9190510407c941ccfa1f11daea1485d66ca1b5cd177d4aff9db0cf85479",
            "status": "error"
          }
        }
      }
    },
    "proxy.ts": {
      "hash": "bd91307f43f7181ddcf2eadd1b4a25d28f5e48440e0f150ff234cbaa5da03a59",
      "status": "error"
    },
    "services": {
      "cart": {
        "index.ts": {
          "hash": "2ba86a88f7f775cff77e9b574ee66d3f703aefc7388aa33d9f72b48cd66974e5",
          "status": "error"
        },
        "_ui": {
          "cart-button.tsx": {
            "hash": "1de1482417e2beac994309975ab3194016f3edab2cf76f57fb2954177eb1bc3b",
            "status": "error"
          }
        }
      },
      "favorites": {
        "index.ts": {
          "hash": "76039ef8170ec7c44657c4bd52fdd245dfd2a2031a86e132d00b500caec0dd4b",
          "status": "error"
        },
        "_ui": {
          "favorites-button.tsx": {
            "hash": "a75c518082c8a1137c90d162347408b883f136fa3458097ea6682d4e6152889d",
            "status": "error"
          }
        }
      },
      "search": {
        "index.ts": {
          "hash": "d0607dc70b3f89444eb0530e05b9fcb8d7b588f8b2735541b94d274b56265cb5",
          "status": "error"
        },
        "_ui": {
          "search-bar.tsx": {
            "hash": "1fb2c6f359d7122462299728439465b1343f72d25a3bfd883dee78872dc1c78d",
            "status": "error"
          }
        }
      },
      "user-profile": {
        "index.ts": {
          "hash": "cba59792fbd4d1602f364d0de10cecde196a8c1fab2c097944774684419e5075",
          "status": "error"
        },
        "_ui": {
          "user-avatar.tsx": {
            "hash": "ab4f393859ecc47abf872a13c0fa45a2af0805d8c1ddfc7976e435bc23c1883b",
            "status": "error"
          },
          "user-popover-content.tsx": {
            "hash": "459e627d7409059b784238bfb936bd5e777f5794b59e8330ab9719ec7a64834d",
            "status": "error"
          },
          "user-profile-button.tsx": {
            "hash": "35fe121de5a3a2b45d8720e32a5981dd6e938e9bf150d43cef80fe4163c89db2",
            "status": "error"
          },
          "user-profile-popover-authenticated.tsx": {
            "hash": "92e872c03063959ccad348c3696e07174a4744d87861a0a00f86b094323a30ee",
            "status": "error"
          },
          "user-profile-popover-guest.tsx": {
            "hash": "daddc966f55975e99a05174a703dbdc959c55f47555255581f758eabac520302",
            "status": "error"
          }
        }
      }
    },
    "shared": {
      "api": {
        "db": {
          "index.ts": {
            "hash": "a302c57036ed44528b1c287a739b2b3687f4ced7e6b2dd418378cb9acf09e32e",
            "status": "error"
          },
          "schemas": {
            "users.ts": {
              "hash": "f717851d9975cc0b8b6302efa39078db2489c1456a04be302eb1f4df83b9ed09",
              "status": "error"
            }
          }
        }
      },
      "config": {
        "env.ts": {
          "hash": "5e873f17ac84ead14e339189ad5fa2e72e7750cc22cc69a926fe746b1947b1ea",
          "status": "error"
        }
      },
      "lib": {
        "auth": {
          "errors.ts": {
            "hash": "cc9ef0c37cc033b66856bf7e80ffa51ccb417b9c00533296a8e72d3d8aa95d75",
            "status": "error"
          },
          "index.ts": {
            "hash": "d8a209bccf59da323164760dd0744219b26931f38a04709399e6832fe554ae55",
            "status": "error"
          },
          "server.ts": {
            "hash": "8c4c1509005b3d8094c02e84a5c94bb24fbfd09b43b9078fb943d0f613cf71c6",
            "status": "error"
          },
          "src": {
            "build-adapter.ts": {
              "hash": "234e7967c2949bbdc93bfed2729a618758d6541ca83bca092ea7ee1c18c49ab0",
              "status": "error"
            },
            "build-next-auth.ts": {
              "hash": "194e31da3bb62ce974c8caf2ccb577d803349cea6492685dafbce6bcd56ea79c",
              "status": "error"
            },
            "build-providers.ts": {
              "hash": "1e1e60e1d88c729e29eef6e4ef70bf79b30c6b3043fd7338ea074d3997735df3",
              "status": "error"
            },
            "types.ts": {
              "hash": "dba73b36e203134733ce1ce56393f73a019823a80cb418bf0c649654265aeccd",
              "status": "error"
            }
          }
        },
        "css.ts": {
          "hash": "a0ffa95c10fd4b8cfec8fb80613807600404bf6553eaead232059a0552a536cd",
          "status": "error"
        },
        "id.ts": {
          "hash": "475c6b090899efbc91ee121c431591d1ddc2b029493635336f51bf6f61065a80",
          "status": "error"
        },
        "react.ts": {
          "hash": "afd0b054f5d18a7bbc5b1bb777f6d53009baeec33f1ae3e6b22915d83c30e919",
          "status": "error"
        },
        "s3.ts": {
          "hash": "b529ed4c0b2060d2f006a626c4876512951ff2ff5de0419bbd8a4f02e79055c5",
          "status": "error"
        },
        "timing.ts": {
          "hash": "49563d21b2f948027799a586a328c362eb4cb1a1107a29256402d53d97f08465",
          "status": "error"
        },
        "transliterate.ts": {
          "hash": "fbf6179c08092261ed9bb7d58122d6d236d9bd095e38088fe0b661cfd318d615",
          "status": "error"
        }
      },
      "ui": {
        "admin-kit": {
          "index.ts": {
            "hash": "c714283abc32cd1371f5db2a86c3c1ed54b33376f58ba030030a3d399c560aca",
            "status": "error"
          },
          "_admin-container": {
            "index.tsx": {
              "hash": "02a54c561c5eb41756829708d8eaee975c0618ce3ea67f925e35baa66040f3d7",
              "status": "error"
            }
          },
          "_admin-nav": {
            "index.tsx": {
              "hash": "08d5f84da3c2fd4fbcd37f42bde862510fa6823f32b708ed6bced86cbd9f1f57",
              "status": "error"
            }
          }
        },
        "image-kit": {
          "index.ts": {
            "hash": "e0b27da9f38207811f92a9a71f5c75754f413d9f74d3dd8d8aef92e934554364",
            "status": "error"
          },
          "_image-compare": {
            "index.tsx": {
              "hash": "8099dec09a56b6891e6ae7a859c1635833166624a17db5e996f0bffd058c579c",
              "status": "error"
            },
            "lib": {
              "common-size.ts": {
                "hash": "254d76910103fc0f6f208d6e65a7c03eb7d8787e7cb89a671346146ef37f7eb5",
                "status": "error"
              },
              "load-images.ts": {
                "hash": "efa9471effa1cf9ff0741b5865a7f192de6e5e092d10ebebccc6b90faa4d606e",
                "status": "error"
              },
              "slider.ts": {
                "hash": "7557d73d587780db96fe88a884896223d5e0762df945560b75930fa01b1fd2be",
                "status": "error"
              }
            },
            "model": {
              "context.ts": {
                "hash": "ddab179ed57d3cf1529248af8b5793ddf88d48ef03a864b55dd90ce4ec3dbdb9",
                "status": "error"
              },
              "store.ts": {
                "hash": "73e51b84ef80eaf269d78e6ecc250af6afb052630e8205cc99a354b44b10344f",
                "status": "error"
              },
              "types.ts": {
                "hash": "a213ddf571b811fd9ef674b1db6964aa40225d4ba6d53bd768726e0dde652473",
                "status": "error"
              }
            },
            "ui": {
              "aspect-ratio-frame.tsx": {
                "hash": "d4900f98135c2b7c564da23ec2fcba3149cb88b3f8964d3914dfc1ec64e75546",
                "status": "error"
              },
              "container.tsx": {
                "hash": "9a62f514dfcfed92508287c07bf048590fcddf452e8eb55f01f6c4e0e511120b",
                "status": "error"
              },
              "content.tsx": {
                "hash": "dc651f3cc9216a42b4036af72ac9bde32eea243022a5a16e8763b24eba8e8034",
                "status": "error"
              },
              "left-image.tsx": {
                "hash": "0e18cef967232b7827a712f33302c501902dcd1c2a855ddcae4a0fbdcb0c1be4",
                "status": "error"
              },
              "provider.tsx": {
                "hash": "74ebfc11002f617c698710cb06ed297b19c1889e7c0186b105a15039bc30adb2",
                "status": "error"
              },
              "right-image.tsx": {
                "hash": "5f55d62681477dc0ad744b3535fc7f7fcfb47b8ff22e6603521c2dd726582902",
                "status": "error"
              },
              "slider-handle.tsx": {
                "hash": "e2b4375423aab7a79e1b3ef223e30f558c6497072712148945544b967fe29a70",
                "status": "error"
              }
            }
          },
          "_image-input": {
            "doubtful": {
              "crop-controls.tsx": {
                "hash": "045cf6c9826b6093ac26fcd98b94c187cf2a15aa79eefbde3dd5eaa3204eaa86",
                "status": "error"
              },
              "crop-number-field.tsx": {
                "hash": "a75fa2950cd6b115b58dc96d9719d5ab74162aac70f95bbd5d065b85a94ba0c6",
                "status": "error"
              },
              "crop-preview.tsx": {
                "hash": "09e3bdb8f4443c6078be0a3b2453f85c93ac77306bd052f408c89b31bd2bf8fd",
                "status": "error"
              },
              "image-crop-section-content.tsx": {
                "hash": "89181dbe126cf5ce615d0a20fba3a2b6f82df5c5976e3bcfca852bec960c1155",
                "status": "error"
              }
            },
            "index.tsx": {
              "hash": "d8b64e01cc17a6bf901bb10e6dd59f4b0d9fb0a7969cacb8a1cd9f30d6779e62",
              "status": "error"
            },
            "lib": {
              "crop-logic.ts": {
                "hash": "a88b7f21ef10cf1629bdc5d2bd7737120351b5cdcb8fe2921f22e919f3a40b2f",
                "status": "error"
              },
              "crop-utils.ts": {
                "hash": "6d823d34ddeef799a91d630ab4459e7405e652280ac3db94e5174a1c539e76f7",
                "status": "error"
              },
              "process-image-item-to-file.ts": {
                "hash": "5f7b97a9af4a1fa1635b3126f771d3e13c2208f9d15d1450e6dba779577baf6c",
                "status": "error"
              }
            },
            "model": {
              "context.ts": {
                "hash": "0e722443893ecfa085134e66e89a437c32b97e6e6b89915146371a5878485d06",
                "status": "error"
              },
              "store.ts": {
                "hash": "074d1b4cec7080d6b4f6a8756beae6771eb6ff5e62441b6f85092b525e754fac",
                "status": "error"
              },
              "types.ts": {
                "hash": "b894819f16d9f22d1a5dc7685a82314a1665c2d11a7c8c4440c1a09c9868f43d",
                "status": "error"
              }
            },
            "ui": {
              "cancel-button.tsx": {
                "hash": "ab232a2e7128fdbc669e78b13b03aee113453efa99e4f91731feea956fc4ef84",
                "status": "error"
              },
              "confirm-button.tsx": {
                "hash": "aef3fcc29d1a4678f04274972e3ab82e2c30aca9430ec74d50cf3ace587edaa7",
                "status": "error"
              },
              "crop-invalid-tooltip.tsx": {
                "hash": "d1a4723e165f6670de62027f626af84f4184586b4863d868db19c75ebebed9e6",
                "status": "error"
              },
              "dialog.tsx": {
                "hash": "fec3200c46ff793778866d3b5279d2bba3722037216c74030f447ca91bedc8b8",
                "status": "error"
              },
              "preview-background-toggle.tsx": {
                "hash": "0992b61e03be3d0ce4ac0415e8191eb1ea594f8ff755692a7a0102aaaba4800a",
                "status": "error"
              },
              "preview-frame.tsx": {
                "hash": "64c581d393df20057b7dceb4ce5970585cbd8aabb78a3dad2c0d9286bcaf1c2e",
                "status": "error"
              },
              "provider.tsx": {
                "hash": "8dbe0e0adb6e27e0e983c8232eae57b074c48a7db212e8552a84106c2a14a8be",
                "status": "error"
              },
              "remove-item-button.tsx": {
                "hash": "009cc101af5b76e06996c7891cc5c8a8a5ceebd209252bd978828d6611ba1b3b",
                "status": "error"
              },
              "sections.tsx": {
                "hash": "f682b2d47b16987820286e797fdea98fce961687d7860dc1d8a4d70dd50f0ae2",
                "status": "error"
              },
              "trigger.tsx": {
                "hash": "f757a64c051982a317bdfa7c6af8fcb06f337c20d5f4e6c6e9ee3407cfe2d7ad",
                "status": "error"
              }
            }
          },
          "_ui": {
            "image-processing-overlay.tsx": {
              "hash": "298163b69b072f9cdb6110ef26874947e781b460d5b5900db6b7c1e91c991833",
              "status": "error"
            }
          }
        },
        "kit": {
          "accordion.tsx": {
            "hash": "a30fac9c76d74aa1b76d92a9aae69f8113b4152292c9008bc13c9e0dfada289d",
            "status": "error"
          },
          "alert-dialog.tsx": {
            "hash": "28efe2a455f5dd6ea246c37db6bc942d054e101be1b1c600b5ed6cf73031c1c3",
            "status": "error"
          },
          "alert.tsx": {
            "hash": "1a54cf1e79e7938278c66362e1109abd8c07563036f246e2bacdeb68f76bd22b",
            "status": "error"
          },
          "aspect-ratio.tsx": {
            "hash": "7706745e217bebbc2d7bdf6697e9c6d484061146ae771755c9b6f240762c7217",
            "status": "error"
          },
          "avatar.tsx": {
            "hash": "28c480089f58c0c31c01816b8cc9ce309f950341ce26ea7a9837c0c074f8da0b",
            "status": "error"
          },
          "badge.tsx": {
            "hash": "d65c467d054c98865d5943e5dc4ae999bc5f08b18e753806e91465ea3f57d008",
            "status": "error"
          },
          "breadcrumb.tsx": {
            "hash": "6b043d6cb4d7bb0136c15860f51701c2ba7d3479f618ba0296ba9c5516771b0f",
            "status": "error"
          },
          "button.tsx": {
            "hash": "b79a2218ff10543cc24f7770a009eec9956c57a0eb5940c193d3b988b0eac9c9",
            "status": "error"
          },
          "calendar.tsx": {
            "hash": "b2a602891f416a5014fa5c2f67db5046dca47fa74097d339c4315a82169a4916",
            "status": "error"
          },
          "card.tsx": {
            "hash": "881b1bdeebb9982fd20ddd621e20ff75d1f7d1eb4b80239e268a86f60663c380",
            "status": "error"
          },
          "carousel.tsx": {
            "hash": "40427ee7dbbcece7b894507e4a42c309108f7c96d0abff8d1d2dc0d7f1e9aa0c",
            "status": "error"
          },
          "chart.tsx": {
            "hash": "1febafaba196d9cbec8609392b13cb761c28bf57bd1630f80855a98b0092d3f4",
            "status": "error"
          },
          "checkbox.tsx": {
            "hash": "69ee56633492cc0291e08f88ac9482b9130896593153f4e1c513702be004bc90",
            "status": "error"
          },
          "collapsible.tsx": {
            "hash": "b763764ebced561c04e2e6ada9dc53375bb90b9f4bcb91b0f3d5de7381aaf0cb",
            "status": "error"
          },
          "command.tsx": {
            "hash": "ab2cd8c7c1e29ed1c1abdaf63f42d977c99ba4ad60e047e02c6b28c55e60f6fe",
            "status": "error"
          },
          "context-menu.tsx": {
            "hash": "30164266f90e053ade0e61ce980ee2d04335956b9fdf4e77d6a6a50a310e48e5",
            "status": "error"
          },
          "dialog.tsx": {
            "hash": "8670bb2e69b0e62b7991fd8e6310c50f50f26bd897af77b88857d3aa48f741e2",
            "status": "error"
          },
          "drawer.tsx": {
            "hash": "ff05034379b2fe49ac6b5204d9517231eabe3a81744ad627172192ac1703e88a",
            "status": "error"
          },
          "dropdown-menu.tsx": {
            "hash": "9ba55ba0da358200c945832611065a339366b95f5e5ed3e7b7a0bb9421304bf8",
            "status": "error"
          },
          "empty.tsx": {
            "hash": "878cfb1e2324d6561d2146fba5802fb22d3b6e6680f14b24d6066a7039970b55",
            "status": "error"
          },
          "field.tsx": {
            "hash": "e1e1f33da5a2875a93d43f742409f6587f6047e15b78d0f379ca621a002699c0",
            "status": "error"
          },
          "form.tsx": {
            "hash": "6eae7954520e85af3b7d7811731e84ed3d82321c6f9e2c1e88b84e1c113980fa",
            "status": "error"
          },
          "header.tsx": {
            "hash": "005dcbc1c13bdae6bdb41d3c64d99babed7367e46f358add6ff2587c69467bde",
            "status": "error"
          },
          "hover-card.tsx": {
            "hash": "640b7c1d1ccbba92f41df9d36325e10ab8b3e41af74b73c75c36a65edf1533d1",
            "status": "error"
          },
          "input-group.tsx": {
            "hash": "dab3c64de93834772d4ca49a72da53228c54e9c2c264e21b5bd2a33cdea7f369",
            "status": "error"
          },
          "input-otp.tsx": {
            "hash": "d78e53d3ae75fb6590fca4edea16b398a539bf41db6fafead3b75558c39b6393",
            "status": "error"
          },
          "input.tsx": {
            "hash": "6be1c722960521a0161b9c7f54309edb0f09e9c97bdad2438add9de0fdedc19b",
            "status": "error"
          },
          "item.tsx": {
            "hash": "4321dc945144eda660a10a880f6c789f3b137f681d2e5e707447b66ee18b068c",
            "status": "error"
          },
          "kbd.tsx": {
            "hash": "3eaa5411d7657fdf39c3cac7e0667e452ba94975e64459a86be536d8e97db98e",
            "status": "error"
          },
          "label.tsx": {
            "hash": "3a6c8a0efbeb43c4caa501963f976d51a45bdda73e946d7feec73f6ba1275567",
            "status": "error"
          },
          "logo.tsx": {
            "hash": "0457c7e7df916dbe7914edf241f321b4275e1717fe7bb47cf0b140dbd7c271e1",
            "status": "error"
          },
          "menubar.tsx": {
            "hash": "24f8341cb5fff8147db62eff334041f8826c3d0e0c9fc5c05ccff85a168e950f",
            "status": "error"
          },
          "navigation-menu.tsx": {
            "hash": "3f9508ff70584d56b1114fbcb2353cd5fb6a0bd75837f6eba746eb8c8a5c7ae6",
            "status": "error"
          },
          "pagination.tsx": {
            "hash": "2a1d1a4ba53f01de96cbffe7550cacca9ac83b21f7499b445e9809d2fed26efe",
            "status": "error"
          },
          "popover.tsx": {
            "hash": "dcf7bf51b5aefe904c7f9315b89c03038d2be4397ae68b24ccbabc364587570d",
            "status": "error"
          },
          "progress.tsx": {
            "hash": "c91f3d77e4a64bc6838a78efce7f481febf23cbc6019899372ed75555823ccbe",
            "status": "error"
          },
          "radio-group.tsx": {
            "hash": "eef9447301b91fa31a9b4fb69a7deb5620213481aa50c05e6d1ff619a6d4956d",
            "status": "error"
          },
          "resizable.tsx": {
            "hash": "9ac87953d8ab95935968a9033d05a7fc822b78caee9fe57243fc149ea4032f83",
            "status": "error"
          },
          "scroll-area.tsx": {
            "hash": "ed4ec8a327237e04a744bb3783046de7e66ff6177ffd55565201bf082ee8aae8",
            "status": "error"
          },
          "select.tsx": {
            "hash": "fa7b003af8b494987fd75a047a654826aa103ed16825f31c39e5f99752a73f7e",
            "status": "error"
          },
          "separator.tsx": {
            "hash": "722fbe9b94c8e48176b406512e78e8949526caa9170fab52ed346ac1e118ac51",
            "status": "error"
          },
          "sheet.tsx": {
            "hash": "4d15ac5945a8131e975425d0fbdd1846be65afc84bef0a9f376854c2a6a00508",
            "status": "error"
          },
          "sidebar.tsx": {
            "hash": "8bd3f4b989cf4bc4651600bba738ae107583f1bfa8f1871ecaf2fa358f4feaff",
            "status": "error"
          },
          "skeleton.tsx": {
            "hash": "de6a35540d64b26d5aad8e15513b3d691d22d9a19e64baf6ab6ae216a04d3ac4",
            "status": "error"
          },
          "slider.tsx": {
            "hash": "c7e40dd4f36f3d0050fba280081cbbde097466adb8922c216735e97af8f7b886",
            "status": "error"
          },
          "sonner.tsx": {
            "hash": "32b0a19879ab7eb836f1708e727452f94ade171cb06f00dce61f269c4263a8fc",
            "status": "error"
          },
          "spinner.tsx": {
            "hash": "99ee88b5ac6d0ef432d95493b99743270639721b67582f681cac4ed0e7e2e4de",
            "status": "error"
          },
          "switch.tsx": {
            "hash": "3c956b930b2a52f946de83d7c82f2a083865350467a4474287f8b422876993c2",
            "status": "error"
          },
          "table.tsx": {
            "hash": "42dbfd96540e85522b6dd77853fef6e411616304d41d57834f0b63e8f86682e5",
            "status": "error"
          },
          "tabs.tsx": {
            "hash": "b88e8d69cab8173db71b1d6b0856d592c807cee7e5e85158a3156ac62711ec78",
            "status": "error"
          },
          "textarea.tsx": {
            "hash": "184ce8c84db85936d4f4d429fcb0b1be0daa9119148e23b436cec7deab40eedb",
            "status": "error"
          },
          "toggle-group.tsx": {
            "hash": "b17a78b8827891c73454f129fcd85092e8166708c558090b0ae509658cc06700",
            "status": "error"
          },
          "toggle.tsx": {
            "hash": "2e1110cd9a46085528fcf5c0602fa1d63df25bfff1030640ce8e30cd9116a6c6",
            "status": "error"
          },
          "tooltip.tsx": {
            "hash": "0406fd71975f0d58f54a0a946c9aca326cb4efddbd94c20466df2644aa6bea78",
            "status": "error"
          }
        },
        "menu": {
          "index.ts": {
            "hash": "6ff1ed9553d01817dfa9f3aba043924a15abd70beeafa9622c0cc51d99325de9",
            "status": "error"
          },
          "_ui": {
            "hamburger-menu.module.css": {
              "hash": "9f82e42f0f3c5e5843963b74620ba4e9376f7724f0a0eed2b371e86bb807f0f5",
              "status": "error"
            },
            "hamburger-menu.tsx": {
              "hash": "92c197028e78bd6475124d5990c21cda8c9305df7d08ee52988f101318794a78",
              "status": "error"
            },
            "menu.tsx": {
              "hash": "a4db5563f75a4befc0a5e9b180d2bac8a565b80cd184b44d34eef0d299776f1f",
              "status": "error"
            },
            "provider.tsx": {
              "hash": "7f5ac4000a8ef21b8f3573fa292052aa6c44d20ae632e81ea6a90c8e1b19f211",
              "status": "error"
            }
          }
        },
        "only-dev-card.tsx": {
          "hash": "65779a8ae51568c1dc64bbdac55405df2aa9541d67f88ced4895dcd5ae0ab76d",
          "status": "error"
        },
        "theme": {
          "index.ts": {
            "hash": "1e6fd2e4beb82569c20d8fbd0108badf2df5a61d0f2c3fde34f0630c7c975148",
            "status": "error"
          },
          "_ui": {
            "mode-toggle.tsx": {
              "hash": "95520ef0676e80a492cf25923d3d93414d1b1e32cb5f839dbd87dd5cdee7d770",
              "status": "error"
            },
            "theme-provider.tsx": {
              "hash": "4f3db6b8fdfcf0c5b2d7c60d7ed468f5d17f252285e38279ea7b534e3a993a41",
              "status": "error"
            }
          }
        }
      }
    }
  },
  "tsconfig.json": {
    "hash": "5a60ca3dbc7dfc69c2ac854f58d862db3022b9b4cc79264705c2caf5f9eab6e5",
    "status": "ok"
  }
};

```

scripts\code-map\_core\code-map.ts

```
import { resolve } from "node:path";
import { cache as baseCache } from "../_cache";
import { initIgnoredExtensionSet } from "../_utils/extension";
import { printStats } from "../_utils/print";
import { saveCacheFile, saveSortedConfig } from "../_utils/save-files";
import { config as baseConfig } from "../config";
import { init } from "./init";
import { mergeCacheIntoConfig } from "./merge";

export async function codeMap({
  paths: { rootDir, cacheFile, configFile },
  ignoredExtensions,
}: {
  paths: {
    rootDir: string;
    cacheFile: string;
    configFile: string;
  };
  ignoredExtensions: string[];
}) {
  initIgnoredExtensionSet(ignoredExtensions);

  const { newCache, newConfig } = await init({
    absPath: rootDir,
    config: baseConfig,
    cache: baseCache,
  });

  mergeCacheIntoConfig(newConfig, newCache);
  printStats();

  await saveCacheFile({ cacheFile, newCache });
  await saveSortedConfig({ configFile, newConfig, rootDir });
}

```

scripts\code-map\_core\init.ts

```
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Cache, Config, Status } from "../_types";

import {
  isCache,
  isCacheFile,
  isConfig,
  isIgnoredEntry,
  isString,
} from "../_utils";
import { shouldIgnoreExtension } from "../_utils/extension";
import { hashFile } from "../_utils/hash-file";
import { incrementFiles } from "../_utils/print";

export async function init({
  absPath,
  config,
  cache,
  defaultStatus,
}: {
  absPath: string;
  config: Config;
  cache: Cache;
  defaultStatus?: Status;
}) {
  const entries = await readdir(absPath, { withFileTypes: true });

  const newConfig: Config = {};
  const newCache: Cache = {};

  for (const entry of entries) {
    const entryName = entry.name;
    const configEntry = config[entryName];
    const cacheEntry = cache[entryName];
    const fullPath = join(absPath, entryName);

    if (isIgnoredEntry(configEntry)) {
      newConfig[entryName] = "ignore";
      continue;
    }

    if (entry.isFile()) {
      if (shouldIgnoreExtension(entryName)) continue;

      const fileHash = await hashFile(fullPath);
      let newStatus: Status = "error";

      const hashesEqual =
        isCacheFile(cacheEntry) && cacheEntry.hash === fileHash;

      if (hashesEqual) {
        if (isString(configEntry)) {
          newStatus = configEntry;
        } else if (defaultStatus) {
          newStatus = defaultStatus;
        } else if (cacheEntry.status) {
          newStatus = cacheEntry.status;
        }
      }

      incrementFiles(newStatus === "ok" ? "ok" : "error");

      newCache[entryName] = {
        hash: fileHash,
        status: newStatus,
      };
    } else if (entry.isDirectory()) {
      let childConfig: Config;
      let childDefaultStatus: Status | undefined = defaultStatus;

      if (isConfig(configEntry)) {
        childConfig = configEntry;
      } else if (isString(configEntry)) {
        childConfig = {};
        childDefaultStatus = configEntry;
      } else {
        childConfig = {};
      }

      const childCache = cacheEntry && isCache(cacheEntry) ? cacheEntry : {};

      const { newConfig: childNewConfig, newCache: childNewCache } = await init(
        {
          absPath: fullPath,
          config: childConfig,
          cache: childCache,
          defaultStatus: childDefaultStatus,
        },
      );

      if (Object.keys(childNewConfig).length > 0) {
        newConfig[entryName] = childNewConfig;
      }
      if (Object.keys(childNewCache).length > 0) {
        newCache[entryName] = childNewCache;
      }
    }
  }

  return { newConfig, newCache };
}

```

scripts\code-map\_core\merge.ts

```
import type { Cache, CacheFile, Config, Status } from "../_types";

export function mergeCacheIntoConfig(config: Config, cache: Cache): void {
  function isCacheNode(value: Cache | CacheFile): value is Cache {
    // У CacheFile есть поле status, у Cache — нет
    return typeof (value as CacheFile).status !== "string";
  }

  // Возвращает единый статус поддерева или null,
  // если статусы смешанные и коллапсить нельзя.
  function getUniformStatus(node: Cache | CacheFile): Status | null {
    if (!isCacheNode(node)) {
      return node.status;
    }

    const entries = Object.values(node);
    if (entries.length === 0) {
      return null;
    }

    let commonStatus: Status | null = null;

    for (const child of entries) {
      const childStatus = getUniformStatus(child);
      if (childStatus === null) return null;

      if (commonStatus === null) {
        commonStatus = childStatus;
      } else if (commonStatus !== childStatus) {
        return null;
      }
    }

    return commonStatus;
  }

  function fillConfigFromCache(target: Config, cacheNode: Cache): void {
    for (const [name, child] of Object.entries(cacheNode)) {
      if (!isCacheNode(child)) {
        // Лист — файл
        const status = child.status;

        // Если хотим, можем записывать статус файла напрямую:
        target[name] = status;
        continue;
      }

      // Директория
      const uniformStatus = getUniformStatus(child);

      if (uniformStatus !== null) {
        // Можно коллапсить всю папку до статуса
        target[name] = uniformStatus;
        continue;
      }

      // Статусы смешаны — нужна вложенная структура
      const current = target[name];

      if (typeof current === "string" || current === undefined) {
        // Был статус или ничего — создаём поддерево
        const newNode: Config = {};
        target[name] = newNode;
        fillConfigFromCache(newNode, child);
      } else {
        // Уже есть поддерево
        fillConfigFromCache(current, child);
      }
    }
  }

  fillConfigFromCache(config, cache);
}

```

scripts\code-map\_types\index.ts

```
export type Config = {
  [name: string]: Config | Status;
};

export type Cache = {
  [name: string]: Cache | CacheFile;
};

export type CacheFile = {
  status: Status;
  hash: string;
};

export type Status = "ok" | "error" | "ignore";

```

scripts\code-map\_utils\extension.ts

```
const ignoredExtensionSet = new Set<string>();

export function initIgnoredExtensionSet(ignoredExtensions: string[]) {
  for (const ext of ignoredExtensions) {
    ignoredExtensionSet.add(normalizeExtension(ext));
  }
}

export function shouldIgnoreExtension(name: string): boolean {
  const ext = getFileExtension(name);
  return ignoredExtensionSet.has(ext);
}

function getFileExtension(filename: string): string {
  for (let i = filename.length - 1; i >= 0; i--) {
    const char = filename[i];

    if (char === ".") {
      if (i === 0) return "";
      return filename.slice(i + 1);
    }
    if (char === "/" || char === "\\") return "";
  }

  return "";
}

function normalizeExtension(ext: string): string {
  return ext.replace(/^\./, "").toLowerCase().trim();
}

```

scripts\code-map\_utils\hash-file.ts

```
export async function hashFile(path: string): Promise<string> {
  const algo = "sha256" as const;

  const file = Bun.file(path);
  const hasher = new Bun.CryptoHasher(algo);

  const data = await file.arrayBuffer();
  hasher.update(data);

  return hasher.digest("hex");
}

```

scripts\code-map\_utils\index.ts

```
import type { Cache, CacheFile, Config } from "../_types";

export function isConfig(value: unknown): value is Config {
  return typeof value === "object" && value !== null;
}

export function isCache(value: unknown): value is Cache {
  return typeof value === "object" && value !== null && !("hash" in value);
}

export function isIgnoredEntry(value: unknown) {
  return value === "ignore";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isCacheFile(
  value: Cache | CacheFile | undefined,
): value is CacheFile {
  return !!value && isString(value.status);
}

```

scripts\code-map\_utils\print.ts

```
let totalHashedFiles = 0;
let totalOkFiles = 0;
let totalErrorFiles = 0;

export function printStats(): void {
  console.log("Hashed files:", totalHashedFiles);
  console.log("OK files:", totalOkFiles);
  console.log("Error files:", totalErrorFiles);

  const okPercent =
    totalHashedFiles === 0 ? 0 : (totalOkFiles / totalHashedFiles) * 100;

  console.log(`OK files percent: ${okPercent.toFixed(2)}%`);
}

export function incrementFiles(status: "ok" | "error"): void {
  totalHashedFiles += 1;

  if (status === "ok") {
    totalOkFiles += 1;
  } else {
    totalErrorFiles += 1;
  }
}

```

scripts\code-map\_utils\save-files.ts

```
import { stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import type { Cache, Config, Status } from "../_types";

export async function saveCacheFile({
  cacheFile,
  newCache,
}: {
  cacheFile: string;
  newCache: Cache;
}) {
  const fileContent = `import type { Cache } from "../_types";

export const cache: Cache = ${JSON.stringify(newCache, null, 2)};
`;

  await writeFile(cacheFile, fileContent, "utf8");
}

// ----------------- SORTED CONFIG -----------------

const statCache = new Map<string, boolean>();

export async function saveSortedConfig({
  newConfig,
  configFile,
  rootDir,
}: {
  newConfig: Config;
  configFile: string;
  rootDir: string;
}): Promise<void> {
  statCache.clear();

  const sortedConfig = await sortConfigNodeByFs(newConfig, rootDir);
  const typesImportPath = getTypesImportPath(configFile);

  // 1) Печать в консоль цветного конфига
  printColoredConfig(sortedConfig);

  // 2) Генерация текста для файла
  const objectLiteral = printConfigAsTsObject(sortedConfig, 2);
  const content = `import type { Config } from "${typesImportPath}";

export const config: Config = ${objectLiteral} as const;
`;

  await writeFile(configFile, content, "utf8");
}

async function isDirectoryCached(path: string): Promise<boolean> {
  if (statCache.has(path)) {
    const cached = statCache.get(path);
    // cached здесь может быть undefined, поэтому подстрахуемся
    return cached === true;
  }

  try {
    const s = await stat(path);
    const isDir = s.isDirectory();
    statCache.set(path, isDir);
    return isDir;
  } catch {
    // нет такого пути / нет прав — считаем, что это не директория
    statCache.set(path, false);
    return false;
  }
}

// type guards

function isStatus(value: unknown): value is Status {
  return value === "ok" || value === "error" || value === "ignore";
}

function isConfigNode(value: unknown): value is Config {
  return typeof value === "object" && value !== null;
}

/**
 * Рекурсивно сортируем узел Config в соответствии с реальной ФС:
 *   - сначала директории (isDirectoryCached === true), по алфавиту
 *   - затем файлы, по алфавиту
 */
async function sortConfigNodeByFs(
  node: Config,
  rootPath: string,
): Promise<Config> {
  const entries = Object.entries(node);

  // dirs: значение либо объект Config, либо строковый статус (collapsed dir)
  const dirs: [string, Config | Status][] = [];
  // files: всегда строковый статус
  const files: [string, Status][] = [];

  for (const [name, value] of entries) {
    const absPath = join(rootPath, name);
    const isDir = await isDirectoryCached(absPath);

    if (isDir) {
      // директория
      if (isConfigNode(value)) {
        const sortedChild = await sortConfigNodeByFs(value, absPath);
        dirs.push([name, sortedChild]);
      } else if (isStatus(value)) {
        // коллапсированная директория "dir": "ok" | "error" | "ignore"
        dirs.push([name, value]);
      } else {
        // теоретически сюда попадать не должны, просто пропустим
      }
    } else {
      // файл: в конфиге для файла всегда статус
      if (isStatus(value)) {
        files.push([name, value]);
      } else {
        // защита от странностей в конфиге
      }
    }
  }

  dirs.sort(([a], [b]) => a.localeCompare(b));
  files.sort(([a], [b]) => a.localeCompare(b));

  const sorted: Config = {};
  for (const [name, value] of dirs) {
    // value: Config | Status
    sorted[name] = value;
  }
  for (const [name, value] of files) {
    // value: Status
    sorted[name] = value;
  }

  return sorted;
}

function getTypesImportPath(configFile: string): string {
  const dir = dirname(configFile);
  const rel = relative(dir, join(dir, "_types")).replace(/\\/g, "/");
  if (!rel || rel === ".") return "./_types";
  if (!rel.startsWith(".")) return `./${rel}`;
  return rel;
}

// ----------------- ПЕЧАТЬ CONFIG КАК TS-ОБЪЕКТ -----------------

// Проверяем, можно ли ключ использовать без кавычек в TS
function canUseBareIdentifier(key: string): boolean {
  // простой идентификатор: буквы, цифры, _ и $, не начинается с цифры
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

// Экранируем строку как в TS
function quoteString(value: string): string {
  return JSON.stringify(value);
}

/**
 * Печатает Config в виде многострочного TS-объекта:
 *
 * {
 *   foo: "ok",
 *   "bar-baz": "error",
 * }
 */
export function printConfigAsTsObject(config: Config, indentSize = 2): string {
  const indentUnit = " ".repeat(indentSize);

  function printNode(node: Config, level: number): string {
    const entries = Object.entries(node);
    const currentIndent = indentUnit.repeat(level);
    const childIndent = indentUnit.repeat(level + 1);

    if (entries.length === 0) {
      return "{}";
    }

    const lines: string[] = ["{"];

    for (const [key, rawValue] of entries) {
      const printedKey = canUseBareIdentifier(key) ? key : quoteString(key);

      if (isConfigNode(rawValue)) {
        const printedValue = printNode(rawValue, level + 1);
        lines.push(`${childIndent}${printedKey}: ${printedValue},`);
      } else if (isStatus(rawValue)) {
        lines.push(`${childIndent}${printedKey}: ${quoteString(rawValue)},`);
      } else {
        // fallback: сериализуем как JSON
        lines.push(`${childIndent}${printedKey}: ${JSON.stringify(rawValue)},`);
      }
    }

    lines.push(`${currentIndent}}`);
    return lines.join("\n");
  }

  return printNode(config, 0);
}

// ----------------- ЦВЕТНАЯ ПЕЧАТЬ CONFIG В КОНСОЛЬ -----------------

const COLOR_RESET = "\x1b[0m";
const COLOR_RED = "\x1b[31m";
const COLOR_GREEN = "\x1b[32m";

function colorStatus(status: Status): string {
  if (status === "error") return `${COLOR_RED}${status}${COLOR_RESET}`;
  if (status === "ok") return `${COLOR_GREEN}${status}${COLOR_RESET}`;
  return status; // ignore — без цвета
}

/**
 * Печать отсортированного Config в консоль c цветными статусами.
 * Формат похож на объект TS, но без `as const` и без import.
 */
function printColoredConfig(config: Config, indentSize = 2): void {
  const indentUnit = " ".repeat(indentSize);

  function printNode(node: Config, level: number): string {
    const entries = Object.entries(node);
    const currentIndent = indentUnit.repeat(level);
    const childIndent = indentUnit.repeat(level + 1);

    if (entries.length === 0) {
      return "{}";
    }

    const lines: string[] = ["{"];

    for (const [key, rawValue] of entries) {
      const printedKey = canUseBareIdentifier(key) ? key : quoteString(key);

      if (isConfigNode(rawValue)) {
        const printedValue = printNode(rawValue, level + 1);
        lines.push(`${childIndent}${printedKey}: ${printedValue},`);
      } else if (isStatus(rawValue)) {
        const colored = colorStatus(rawValue);
        lines.push(`${childIndent}${printedKey}: "${colored}",`);
      } else {
        lines.push(`${childIndent}${printedKey}: ${JSON.stringify(rawValue)},`);
      }
    }

    lines.push(`${currentIndent}}`);
    return lines.join("\n");
  }

  const printed = printNode(config, 0);
  console.log("\nSorted config:\n");
  console.log(printed);
  console.log(); // пустая строка в конце
}

```