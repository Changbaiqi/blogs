---
title: Apollo编译阶段zlib报错问题
date: 2026-02-21 17:58:49
author: 长白崎
categories:
  - "AI"
    "Apollo"
tags:
  - "AI"
    "Apollo"
---

# Apollo编译阶段zlib报错问题

记录一次在编译Apollo过程中出现的zlib问题。

使用的版本是Apollo v7.0.0

若在构建时zlib报错，比如：

```shell
(17:08:13) INFO: Repository zlib instantiated at: /apollo/WORKSPACE:37:25: in <toplevel> /apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/rules_proto/proto/repositories.bzl:23:21: in rules_proto_dependencies Repository rule http_archive defined at: /apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/bazel_tools/tools/build_defs/repo/http.bzl:336:31: in <toplevel> (17:08:13) WARNING: Download from https://zlib.net/zlib-1.2.11.tar.gz failed: class com.google.devtools.build.lib.bazel.repository.downloader.UnrecoverableHttpException GET returned 404 Not Found (17:08:13) ERROR: An error occurred during the fetch of repository 'zlib': Traceback (most recent call last): File "/apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/bazel_tools/tools/build_defs/repo/http.bzl", line 111, column 45, in _http_archive_impl download_info = ctx.download_and_extract( Error in download_and_extract: java.io.IOException: Error downloading [https://zlib.net/zlib-1.2.11.tar.gz] to /apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/zlib/temp16399307772200535958/zlib-1.2.11.tar.gz: GET returned 404 Not Found (17:08:13) INFO: Repository remote_coverage_tools instantiated at: /DEFAULT.WORKSPACE.SUFFIX:11:13: in <toplevel> Repository rule http_archive defined at: /apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/bazel_tools/tools/build_defs/repo/http.bzl:336:31: in <toplevel> (17:08:13) ERROR: /apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/com_google_protobuf/BUILD:210:11: @com_google_protobuf//:protobuf depends on @zlib//:zlib in repository @zlib which failed to fetch. no such package '@zlib//': java.io.IOException: Error downloading [https://zlib.net/zlib-1.2.11.tar.gz] to /apollo/.cache/bazel/540135163923dd7d5820f3ee4b306b32/external/zlib/temp16399307772200535958/zlib-1.2.11.tar.gz: GET returned 404 Not Found (17:08:13) ERROR: Analysis of target '//cyber/common:global_data' failed; build aborted: Analysis failed (17:08:14) INFO: Elapsed time: 46.966s (17:08:14) INFO: 0 processes. (17:08:14) FAILED: Build did NOT complete successfully (95 packages loaded, 11\ 79 targets configured)
```

这种一般是因为Bazel中zlib无法正常拉取zlib导致的，这个时候我们只需要修改`WORKSPACE`中的代码即可。我们打开`WORKSPACE`在 `rules_proto_dependencies()` 之前“提前定义”新的zlib（覆盖它）

新的zlib代码如下:

```python
http_archive(
    name = "zlib",
    urls = [
        "https://mirror.bazel.build/zlib.net/zlib-1.2.11.tar.gz",
        "https://zlib.net/zlib-1.2.11.tar.gz",
    ],
    strip_prefix = "zlib-1.2.11",
    build_file_content = """
package(default_visibility = ["//visibility:public"])

cc_library(
    name = "zlib",
    hdrs = glob(["*.h"]),
    srcs = glob(["*.c"]),
    includes = ["."],
)
""",
)
```

