{
  "variables" : {
    "openssl_fips": ""
  },
  "targets": [
    {
      "target_name": "fninspect",
      "sources": [
        "src/addon.cc"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        [
          "OS == 'mac'",
          {
            "xcode_settings": {
              "OTHER_CFLAGS": [
                "-arch x86_64",
                "-arch arm64"
              ],
              "OTHER_LDFLAGS": [
                "-arch x86_64",
                "-arch arm64"
              ]
            }
          }
        ]
      ]
    }
  ]
}
