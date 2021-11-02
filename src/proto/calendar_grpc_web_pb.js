/**
 * @fileoverview gRPC-Web generated client stub for calendarpb
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js')

var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js')
const proto = {};
proto.calendarpb = require('./calendar_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.calendarpb.CalendarClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.calendarpb.CalendarPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Schedule,
 *   !proto.calendarpb.ResponseSchedule>}
 */
const methodDescriptor_Calendar_CreateSchedule = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/CreateSchedule',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Schedule,
  proto.calendarpb.ResponseSchedule,
  /**
   * @param {!proto.calendarpb.Schedule} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseSchedule.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Schedule,
 *   !proto.calendarpb.ResponseSchedule>}
 */
const methodInfo_Calendar_CreateSchedule = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ResponseSchedule,
  /**
   * @param {!proto.calendarpb.Schedule} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseSchedule.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Schedule} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ResponseSchedule)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ResponseSchedule>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.createSchedule =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/CreateSchedule',
      request,
      metadata || {},
      methodDescriptor_Calendar_CreateSchedule,
      callback);
};


/**
 * @param {!proto.calendarpb.Schedule} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ResponseSchedule>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.createSchedule =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/CreateSchedule',
      request,
      metadata || {},
      methodDescriptor_Calendar_CreateSchedule);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Schedule,
 *   !proto.calendarpb.ResponseSchedule>}
 */
const methodDescriptor_Calendar_UpdateSchedule = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/UpdateSchedule',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Schedule,
  proto.calendarpb.ResponseSchedule,
  /**
   * @param {!proto.calendarpb.Schedule} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseSchedule.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Schedule,
 *   !proto.calendarpb.ResponseSchedule>}
 */
const methodInfo_Calendar_UpdateSchedule = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ResponseSchedule,
  /**
   * @param {!proto.calendarpb.Schedule} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseSchedule.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Schedule} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ResponseSchedule)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ResponseSchedule>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.updateSchedule =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/UpdateSchedule',
      request,
      metadata || {},
      methodDescriptor_Calendar_UpdateSchedule,
      callback);
};


/**
 * @param {!proto.calendarpb.Schedule} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ResponseSchedule>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.updateSchedule =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/UpdateSchedule',
      request,
      metadata || {},
      methodDescriptor_Calendar_UpdateSchedule);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.google.protobuf.Empty,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodDescriptor_Calendar_GetScheduleList = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/GetScheduleList',
  grpc.web.MethodType.UNARY,
  google_protobuf_empty_pb.Empty,
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.google.protobuf.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.google.protobuf.Empty,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodInfo_Calendar_GetScheduleList = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.google.protobuf.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ScheduleList)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ScheduleList>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.getScheduleList =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/GetScheduleList',
      request,
      metadata || {},
      methodDescriptor_Calendar_GetScheduleList,
      callback);
};


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ScheduleList>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.getScheduleList =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/GetScheduleList',
      request,
      metadata || {},
      methodDescriptor_Calendar_GetScheduleList);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.User,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodDescriptor_Calendar_SearchScheduleByUserId = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/SearchScheduleByUserId',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.User,
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.User} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.User,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodInfo_Calendar_SearchScheduleByUserId = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.User} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @param {!proto.calendarpb.User} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ScheduleList)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ScheduleList>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.searchScheduleByUserId =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByUserId',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByUserId,
      callback);
};


/**
 * @param {!proto.calendarpb.User} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ScheduleList>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.searchScheduleByUserId =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByUserId',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByUserId);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.User,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodDescriptor_Calendar_SearchScheduleByUserName = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/SearchScheduleByUserName',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.User,
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.User} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.User,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodInfo_Calendar_SearchScheduleByUserName = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.User} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @param {!proto.calendarpb.User} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ScheduleList)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ScheduleList>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.searchScheduleByUserName =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByUserName',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByUserName,
      callback);
};


/**
 * @param {!proto.calendarpb.User} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ScheduleList>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.searchScheduleByUserName =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByUserName',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByUserName);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Tag,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodDescriptor_Calendar_SearchScheduleByTagName = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/SearchScheduleByTagName',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Tag,
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.Tag} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Tag,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodInfo_Calendar_SearchScheduleByTagName = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.Tag} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Tag} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ScheduleList)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ScheduleList>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.searchScheduleByTagName =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByTagName',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByTagName,
      callback);
};


/**
 * @param {!proto.calendarpb.Tag} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ScheduleList>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.searchScheduleByTagName =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByTagName',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByTagName);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Date,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodDescriptor_Calendar_SearchScheduleByDate = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/SearchScheduleByDate',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Date,
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.Date} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Date,
 *   !proto.calendarpb.ScheduleList>}
 */
const methodInfo_Calendar_SearchScheduleByDate = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ScheduleList,
  /**
   * @param {!proto.calendarpb.Date} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ScheduleList.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Date} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ScheduleList)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ScheduleList>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.searchScheduleByDate =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByDate',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByDate,
      callback);
};


/**
 * @param {!proto.calendarpb.Date} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ScheduleList>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.searchScheduleByDate =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/SearchScheduleByDate',
      request,
      metadata || {},
      methodDescriptor_Calendar_SearchScheduleByDate);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Schedule,
 *   !proto.calendarpb.ResponseSchedule>}
 */
const methodDescriptor_Calendar_DeleteSchedule = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/DeleteSchedule',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Schedule,
  proto.calendarpb.ResponseSchedule,
  /**
   * @param {!proto.calendarpb.Schedule} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseSchedule.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Schedule,
 *   !proto.calendarpb.ResponseSchedule>}
 */
const methodInfo_Calendar_DeleteSchedule = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ResponseSchedule,
  /**
   * @param {!proto.calendarpb.Schedule} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseSchedule.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Schedule} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ResponseSchedule)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ResponseSchedule>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.deleteSchedule =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/DeleteSchedule',
      request,
      metadata || {},
      methodDescriptor_Calendar_DeleteSchedule,
      callback);
};


/**
 * @param {!proto.calendarpb.Schedule} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ResponseSchedule>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.deleteSchedule =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/DeleteSchedule',
      request,
      metadata || {},
      methodDescriptor_Calendar_DeleteSchedule);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Tag,
 *   !proto.calendarpb.ResponseTag>}
 */
const methodDescriptor_Calendar_CreateTag = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/CreateTag',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Tag,
  proto.calendarpb.ResponseTag,
  /**
   * @param {!proto.calendarpb.Tag} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseTag.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Tag,
 *   !proto.calendarpb.ResponseTag>}
 */
const methodInfo_Calendar_CreateTag = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ResponseTag,
  /**
   * @param {!proto.calendarpb.Tag} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseTag.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Tag} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ResponseTag)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ResponseTag>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.createTag =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/CreateTag',
      request,
      metadata || {},
      methodDescriptor_Calendar_CreateTag,
      callback);
};


/**
 * @param {!proto.calendarpb.Tag} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ResponseTag>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.createTag =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/CreateTag',
      request,
      metadata || {},
      methodDescriptor_Calendar_CreateTag);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.calendarpb.Tag,
 *   !proto.calendarpb.ResponseTag>}
 */
const methodDescriptor_Calendar_UpdateTag = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/UpdateTag',
  grpc.web.MethodType.UNARY,
  proto.calendarpb.Tag,
  proto.calendarpb.ResponseTag,
  /**
   * @param {!proto.calendarpb.Tag} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseTag.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.calendarpb.Tag,
 *   !proto.calendarpb.ResponseTag>}
 */
const methodInfo_Calendar_UpdateTag = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.ResponseTag,
  /**
   * @param {!proto.calendarpb.Tag} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.ResponseTag.deserializeBinary
);


/**
 * @param {!proto.calendarpb.Tag} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.ResponseTag)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.ResponseTag>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.updateTag =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/UpdateTag',
      request,
      metadata || {},
      methodDescriptor_Calendar_UpdateTag,
      callback);
};


/**
 * @param {!proto.calendarpb.Tag} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.ResponseTag>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.updateTag =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/UpdateTag',
      request,
      metadata || {},
      methodDescriptor_Calendar_UpdateTag);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.google.protobuf.Empty,
 *   !proto.calendarpb.TagList>}
 */
const methodDescriptor_Calendar_GetTagList = new grpc.web.MethodDescriptor(
  '/calendarpb.Calendar/GetTagList',
  grpc.web.MethodType.UNARY,
  google_protobuf_empty_pb.Empty,
  proto.calendarpb.TagList,
  /**
   * @param {!proto.google.protobuf.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.TagList.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.google.protobuf.Empty,
 *   !proto.calendarpb.TagList>}
 */
const methodInfo_Calendar_GetTagList = new grpc.web.AbstractClientBase.MethodInfo(
  proto.calendarpb.TagList,
  /**
   * @param {!proto.google.protobuf.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.calendarpb.TagList.deserializeBinary
);


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.calendarpb.TagList)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.calendarpb.TagList>|undefined}
 *     The XHR Node Readable Stream
 */
proto.calendarpb.CalendarClient.prototype.getTagList =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/calendarpb.Calendar/GetTagList',
      request,
      metadata || {},
      methodDescriptor_Calendar_GetTagList,
      callback);
};


/**
 * @param {!proto.google.protobuf.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.calendarpb.TagList>}
 *     Promise that resolves to the response
 */
proto.calendarpb.CalendarPromiseClient.prototype.getTagList =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/calendarpb.Calendar/GetTagList',
      request,
      metadata || {},
      methodDescriptor_Calendar_GetTagList);
};


module.exports = proto.calendarpb;

