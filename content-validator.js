"use strict";
var contentValidator = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // content-validator.ts
  var content_validator_exports = {};
  __export(content_validator_exports, {
    validate: () => validate2
  });

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/rule.ts
  var CommonBuilder = class {
    constructor({ constraints, severity, message, optional } = {}) {
      this.severity = "error";
      this.isOptional = false;
      this.constraints = constraints ?? [];
      this.severity = severity ?? "error";
      this.message = message ?? null;
      this.isOptional = optional ?? false;
    }
    clone(patch) {
      const Constructor = this.constructor;
      const newInstance = new Constructor({
        constraints: patch.constraints ?? this.constraints,
        severity: patch.severity ?? this.severity,
        message: patch.message ?? this.message,
        optional: patch.optional ?? this.isOptional
      });
      return newInstance;
    }
    addConstraint(constraint) {
      return this.clone({ constraints: [...this.constraints, constraint] });
    }
    optional() {
      return this.clone({ optional: true });
    }
    error(message) {
      return this.clone({ severity: "error", message });
    }
    warn(message) {
      return this.clone({ severity: "warning", message });
    }
    custom(validator) {
      return this.addConstraint({ type: "custom", validator });
    }
    build() {
      let result = {
        type: "list",
        constraints: this.constraints
      };
      if (this.type) {
        result = {
          type: "type",
          of: this.type,
          constraint: result
        };
      }
      if (this.message) {
        result = {
          type: "message",
          message: this.message,
          severity: this.severity,
          constraint: result
        };
      }
      if (this.isOptional) {
        result = {
          type: "optional",
          constraint: result
        };
      }
      return result;
    }
  };
  var StringBuilder = class extends CommonBuilder {
    constructor() {
      super(...arguments);
      this.type = "string";
    }
    minLength(value) {
      return this.addConstraint({ type: "minLength", number: value });
    }
    maxLength(value) {
      return this.addConstraint({ type: "maxLength", number: value });
    }
    regex(value) {
      return this.addConstraint({ type: "regex", regex: value.source });
    }
  };
  var NumberBuilder = class extends CommonBuilder {
    constructor() {
      super(...arguments);
      this.type = "number";
    }
    min(value) {
      return this.addConstraint({ type: "min", number: value });
    }
    max(value) {
      return this.addConstraint({ type: "max", number: value });
    }
  };
  var ArrayBuilder = class extends CommonBuilder {
    constructor() {
      super(...arguments);
      this.type = "array";
    }
    minLength(value) {
      return this.addConstraint({ type: "minLength", number: value });
    }
    maxLength(value) {
      return this.addConstraint({ type: "maxLength", number: value });
    }
  };
  var ObjectBuilder = class extends CommonBuilder {
    constructor() {
      super(...arguments);
      this.type = "object";
    }
  };
  var GenericBuilder = class extends CommonBuilder {
    constructor() {
      super(...arguments);
      this.type = "any";
    }
  };
  var genericValidator = {
    list: (validator, constraint, value, document) => {
      return constraint.constraints.reduce((acc, constraint2) => {
        return [...acc, ...validateConstraint(validator, constraint2, value, document)];
      }, []);
    },
    optional: (validator, constraint, value, document) => {
      if (value === void 0 || value === null) {
        return [];
      }
      return validateConstraint(validator, constraint.constraint, value, document);
    },
    custom: (_, constraint, value, document) => {
      const res = constraint.validator(value, document);
      if (Array.isArray(res)) {
        return res;
      }
      return res ? [] : [{ message: "Validation failed" }];
    },
    message: (validator, constraint, value, document) => {
      const results = validateConstraint(validator, constraint.constraint, value, document);
      if (results.length > 0) {
        return [
          {
            message: constraint.message,
            severity: constraint.severity
          }
        ];
      } else {
        return [];
      }
    },
    type: (_, constraint, value, document) => {
      if (!typeChecks[constraint.of](value)) {
        return [
          {
            message: `Value is not a ${constraint.of}`,
            severity: "error"
          }
        ];
      }
      return validateConstraint(
        typeValidators[constraint.of] ?? genericValidator,
        constraint.constraint,
        value,
        document
      );
    }
  };
  var typeChecks = {
    string: (value) => typeof value === "string",
    number: (value) => typeof value === "number",
    boolean: (value) => typeof value === "boolean",
    object: (value) => typeof value === "object",
    array: (value) => Array.isArray(value),
    any: (value) => true
  };
  function validateConstraint(validator, constraint, value, document) {
    return validator[constraint.type](validator, constraint, value, document);
  }
  var stringValidator = {
    ...genericValidator,
    minLength: (_, constraint, value) => {
      if (value.length < constraint.number) {
        return [
          {
            message: `Must be at least ${constraint.number} characters`,
            severity: "error"
          }
        ];
      }
      return [];
    },
    maxLength: (_, constraint, value) => {
      if (value.length > constraint.number) {
        return [
          {
            message: `Must be at most ${constraint.number} characters`,
            severity: "error"
          }
        ];
      }
      return [];
    },
    regex: (_, constraint, value) => {
      const regex = new RegExp(constraint.regex);
      if (!regex.test(value)) {
        return [
          {
            message: `Must match regex ${constraint.regex}`,
            severity: "error"
          }
        ];
      }
      return [];
    }
  };
  var numberValidator = {
    ...genericValidator,
    min: (_, constraint, value) => {
      if (value < constraint.number) {
        return [
          {
            message: `Must be at least ${constraint.number}`,
            severity: "error"
          }
        ];
      }
      return [];
    },
    max: (_, constraint, value) => {
      if (value > constraint.number) {
        return [
          {
            message: `Must be at most ${constraint.number}`,
            severity: "error"
          }
        ];
      }
      return [];
    }
  };
  var arrayValidator = {
    ...genericValidator,
    minLength: (_, constraint, value) => {
      if (value.length < constraint.number) {
        return [
          {
            message: `Must be at least ${constraint.number} items`,
            severity: "error"
          }
        ];
      }
      return [];
    },
    maxLength: (_, constraint, value) => {
      if (value.length > constraint.number) {
        return [
          {
            message: `Must be at most ${constraint.number} items`,
            severity: "error"
          }
        ];
      }
      return [];
    }
  };
  var typeValidators = {
    string: stringValidator,
    number: numberValidator,
    boolean: null,
    object: genericValidator,
    array: arrayValidator,
    any: genericValidator
  };
  function validate(constraint, value, document) {
    return validateConstraint(genericValidator, constraint, value, document);
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/builder.ts
  function buildSchema(contentSchema) {
    return {
      ...contentSchema,
      contentTypes: contentSchema.contentTypes.map(buildSchemaType),
      contentEntries: contentSchema.contentEntries.map(buildDocumentEntry)
    };
  }
  function buildDocumentEntry(entry) {
    switch (entry.type) {
      case "list":
        return {
          ...entry,
          contentType: buildSchemaType(entry.contentType)
        };
      case "constant":
        return {
          ...entry,
          contentType: buildSchemaType(entry.contentType)
        };
    }
  }
  function buildSchemaType(type) {
    switch (type.type) {
      case "canned":
        return type;
      case "custom":
      case void 0:
        return {
          ...type,
          fields: type.fields.map((field) => buildSchemaField(field)),
          constraints: build(type.validation?.(new GenericBuilder()))
        };
    }
  }
  function buildSchemaField(type) {
    return schemaFieldBuilder[type.type](schemaFieldBuilder, type);
  }
  var schemaFieldBuilder = {
    text: (builder, field) => {
      return {
        ...field,
        constraints: build(field.validation?.(new StringBuilder()))
      };
    },
    number: (builder, field) => {
      return {
        ...field,
        constraints: build(field.validation?.(new NumberBuilder()))
      };
    },
    checkbox: (builder, field) => {
      return field;
    },
    picklist: (builder, field) => {
      return {
        ...field,
        constraints: build(field.validation?.(new GenericBuilder()))
      };
    },
    file: (builder, field) => {
      return field;
    },
    array: (builder, field) => {
      return {
        ...field,
        childType: builder[field.childType.type](builder, field.childType),
        constraints: build(field.validation?.(new ArrayBuilder()))
      };
    },
    reference: (builder, field) => {
      return field;
    },
    object: (builder, field) => {
      return {
        ...field,
        fields: field.fields.map((f) => builder[f.type](builder, f)),
        constraints: build(field.validation?.(new ObjectBuilder()))
      };
    },
    constant: (builder, field) => {
      return field;
    },
    multiline: (builder, field) => {
      return {
        ...field,
        constraints: build(field.validation?.(new StringBuilder()))
      };
    },
    code: (builder, field) => {
      return field;
    },
    per_environment: (builder, field) => {
      return {
        ...field,
        childType: builder[field.childType.type](builder, field.childType)
      };
    },
    per_resource: (builder, field) => {
      return {
        ...field,
        childType: builder[field.childType.type](builder, field.childType)
      };
    },
    resource: (builder, field) => {
      return field;
    },
    per_locale: (builder, field) => {
      return {
        ...field,
        childType: builder[field.childType.type](builder, field.childType)
      };
    },
    secret: (builder, field) => {
      return {
        ...field,
        constraints: build(field.validation?.(new StringBuilder()))
      };
    },
    markdown: (builder, field) => {
      return field;
    },
    date: (builder, field) => {
      return field;
    },
    provider: (builder, field) => {
      return field;
    },
    oauth: (builder, field) => {
      return field;
    }
  };
  function build(rules) {
    if (!rules) {
      return void 0;
    }
    if (!Array.isArray(rules)) {
      return rules.build();
    }
    return {
      type: "list",
      constraints: rules.flatMap((rule) => rule.build())
    };
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/schema.ts
  function findDocumentEntries(entries) {
    return entries.flatMap(findDocumentEntriesForEntry);
  }
  function findDocumentEntriesForEntry(entry) {
    switch (entry.type) {
      case "folder":
        return findDocumentEntries(entry.children);
      case "list":
      case "constant":
        return [entry];
      case "entry":
        return [];
    }
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/validate-schema.ts
  function isValidSchemaIdentifier(str) {
    const regex = /^[a-zA-Z][a-zA-Z0-9_$]*$/;
    return regex.test(str);
  }
  function validateEntry(entry) {
    if (entry.name.length === 0) {
      throw new Error("Invalid content entry: name cannot be empty");
    }
    if (entry.name.includes(".")) {
      throw new Error(
        `Invalid content entry ${entry.name}: name must not contain "." because fields are indexed by dot path`
      );
    }
    return entry;
  }
  function validateType(type) {
    if (type.type === "canned") {
      return type;
    }
    if (type.name.length === 0) {
      throw new Error("Invalid content type: name cannot be empty");
    }
    if (!isValidSchemaIdentifier(type.name)) {
      throw new Error(
        `Invalid content type ${type.name}: name must be a valid typescript identifier`
      );
    }
    if (type.fields.length === 0) {
      throw new Error(`Invalid content type ${type.name}: type has no fields`);
    }
    const fieldNames = type.fields.map((field) => field.name);
    const seen = /* @__PURE__ */ new Set();
    const duplicates = /* @__PURE__ */ new Set();
    fieldNames.forEach((name) => {
      if (seen.has(name)) {
        duplicates.add(name);
      } else {
        seen.add(name);
      }
    });
    if (duplicates.size > 0) {
      throw new Error(
        `Invalid content type ${type.name}: duplicate field names ${Array.from(duplicates).join(", ")}`
      );
    }
    return type;
  }
  var SINGLE_CHILD_WRAPPER_TYPES = ["per_environment", "per_resource", "per_locale"];
  function isSingleChildWrapperType(type) {
    return SINGLE_CHILD_WRAPPER_TYPES.includes(type);
  }
  function validateField(field) {
    if (field.name.length === 0) {
      throw new Error("Invalid field: name cannot be empty");
    }
    if (!isValidSchemaIdentifier(field.name)) {
      throw new Error(`Invalid field ${field.name}: name must be a valid typescript identifier`);
    }
    if (field.label.length === 0) {
      throw new Error(`Invalid field ${field.name}: label cannot be empty`);
    }
    if (field.type === "picklist") {
      if (field.items.length === 0) {
        throw new Error(`Invalid field ${field.name}: picklist has no items`);
      }
    }
    if (field.type === "per_environment" || field.type === "per_resource" || field.type === "per_locale") {
      const childTypeName = field.childType.type;
      if (childTypeName !== void 0 && isSingleChildWrapperType(childTypeName)) {
        throw new Error(
          `Invalid field ${field.name}: ${field.type} cannot wrap ${childTypeName}; nest at most one of per_environment / per_resource / per_locale per leaf`
        );
      }
    }
    return field;
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/definitions.ts
  function defineField(field) {
    return validateField(field);
  }
  function defineType(type, opts = {}) {
    const typeWithFields = {
      ...type,
      fields: [...type.fields]
    };
    const contentType = opts.skipValidation ?? false ? {
      ...typeWithFields,
      type: "custom"
    } : validateType({
      ...typeWithFields,
      type: "custom"
    });
    if (type.version) {
      return {
        ...contentType,
        fields: [...contentType.fields, versionField(type.version)]
      };
    }
    return contentType;
  }
  function defineListEntry({
    type,
    ...options
  }) {
    return validateEntry({
      type: "list",
      typeName: type.name,
      contentType: type,
      ...options
    });
  }
  function defineConstantEntry({
    type,
    ...options
  }) {
    return validateEntry({
      type: "constant",
      typeName: type.name,
      contentType: type,
      ...options
    });
  }
  function defineContentFolder({
    children,
    ...options
  }) {
    return {
      type: "folder",
      children,
      ...options
    };
  }
  function defineSchema({ contentFolders }) {
    const entriesFromFolders = findDocumentEntries(contentFolders);
    const typesFromFolders = Array.from(
      // get distinct types
      new Set(entriesFromFolders.map((entry) => entry.contentType))
    );
    return buildSchema({
      version: 1,
      contentTypes: typesFromFolders,
      contentEntries: entriesFromFolders,
      contentFolders
    });
  }
  function versionField(version) {
    return {
      type: "constant",
      name: "$version",
      showIf: {
        type: "constant",
        value: false
      },
      label: "Version",
      value: version
    };
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/types.ts
  var equals = (field, value) => ({
    type: "field",
    field,
    comparison: { type: "equals", value }
  });

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/common/operating-hours.ts
  function operatingHours(options = {}) {
    const { validate: validate3 = true, increment = 60 } = options;
    return [
      operatingHoursForDay("sunday", { hideHeaders: false, validate: validate3, increment }),
      operatingHoursForDay("monday", { hideHeaders: true, validate: validate3, increment }),
      operatingHoursForDay("tuesday", { hideHeaders: true, validate: validate3, increment }),
      operatingHoursForDay("wednesday", { hideHeaders: true, validate: validate3, increment }),
      operatingHoursForDay("thursday", { hideHeaders: true, validate: validate3, increment }),
      operatingHoursForDay("friday", { hideHeaders: true, validate: validate3, increment }),
      operatingHoursForDay("saturday", { hideHeaders: true, validate: validate3, increment })
    ];
  }
  function operatingHoursForDay(dow, options) {
    const { hideHeaders, validate: validate3, increment } = options ?? {};
    return defineField({
      "type": "object",
      "name": dow,
      "label": capitalize(dow),
      "display": {
        "type": "rows",
        "rows": [
          [
            {
              "field": "enabled",
              "display": {
                "basis": 120,
                "grow": 0,
                "shrink": 0
              }
            },
            {
              "field": "start",
              "display": {
                "basis": 120,
                "grow": 0,
                "shrink": 0
              }
            },
            {
              "field": "end",
              "display": {
                "basis": 120,
                "grow": 0,
                "shrink": 0
              }
            }
          ]
        ]
      },
      "validation": validate3 ? (r) => [
        r.custom((value) => {
          const v = value;
          return !(v.enabled && v.start == v.end);
        }).error("Start and end times cannot be the same")
      ] : void 0,
      "fields": [
        defineField({
          "type": "constant",
          "showIf": { type: "constant", value: false },
          "hiddenMode": "collapsed",
          "name": "increment",
          "label": "Increment",
          "value": `${increment}`
        }),
        defineField({
          "type": "checkbox",
          "name": "enabled",
          "label": capitalize(dow),
          "heading": hideHeaders ? void 0 : "Day"
        }),
        defineField({
          "type": "picklist",
          "name": `start`,
          "hideLabel": hideHeaders ?? true,
          "label": "Start",
          "showIf": equals(`${dow}.enabled`, true),
          "hiddenMode": "invisible",
          "items": hours(increment)
        }),
        defineField({
          "type": "picklist",
          "name": `end`,
          "hideLabel": hideHeaders ?? true,
          "label": "End",
          "showIf": equals(`${dow}.enabled`, true),
          "hiddenMode": "invisible",
          "items": hours(increment)
        })
      ]
    });
  }
  function hours(increment = 60) {
    const items = [];
    for (let minutes = 0; minutes < 24 * 60; minutes += increment) {
      const hour = Math.floor(minutes / 60) % 24;
      const minute = minutes % 60;
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const id = `${minutes}`;
      const label = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
      items.push({ id, label });
    }
    items.push({ id: `${24 * 60}`, label: "12:00 AM" });
    return items;
  }
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/abuse-types.ts
  var ABUSE_TYPES = [
    {
      id: "PersuadePolicies",
      label: "Persuading about policies",
      description: "Customer is persistently attempting to persuade the AI about specific policies or procedures that contradict the agent",
      isCore: true
    },
    {
      id: "HateHarassmentAbuse",
      label: "Hate, harassment, or abuse",
      description: "Customer is being insulting or expressing hate, harassment, or discrimination toward people or protected groups",
      isCore: true
    },
    {
      id: "SexualContent",
      label: "Sexual content",
      description: "Customer is discussing or asking about sexual content, sexual anatomy, or sexual acts",
      isCore: true
    },
    {
      id: "SelfHarm",
      label: "Self harm",
      description: "Customer is mentioning or asking about self-harm or suicide",
      isCore: true
    },
    {
      id: "Illegal",
      label: "Illegal activity",
      description: "Customer is mentioning or asking about illegal activities (fraud, drugs, surveillance, hacking, piracy)",
      isCore: true
    },
    {
      id: "ChildEndangerment",
      label: "Child endangerment",
      description: "Customer is mentioning or asking about child endangerment, including CSAM",
      isCore: true
    },
    {
      id: "HighRiskAdvice",
      label: "High-risk advice",
      description: "Customer is asking for regulated or high-risk advice (medical, legal, financial)",
      isCore: true
    },
    {
      id: "Violence",
      label: "Violence",
      description: "Customer is discussing harm to animals, weapons, explosives, or other violent activities",
      isCore: true
    },
    {
      id: "Jailbreak",
      label: "Jailbreak attempts",
      description: "Customer is attempting prompt injection or other manipulation",
      isCore: true
    },
    {
      id: "DiscussPublicEntities",
      label: "Discussing public entities",
      description: "Customer is asking the agent to discuss other companies, public figures, or named individuals unaffiliated with the brand",
      isCore: true
    },
    {
      id: "OutOfBounds",
      label: "Off-topic conversations",
      description: "Customer is asking the agent to do something entirely unrelated to the topic, including off-topic, philosophical, religious, or political requests",
      isCore: true
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/agent-config-options.ts
  var GOAL_DEFAULT_OPTIONS = [
    { id: "conservative-transfer", label: "Conservative transfer" },
    { id: "detect-deadlocks", label: "Detect deadlocks" },
    { id: "standard-prompts", label: "Standard prompts" },
    { id: "detect-missing-policy", label: "Detect missing policy" },
    { id: "voice-attachments", label: "Suppress voice attachments" },
    { id: "reasoning-progress-indicator", label: "Reasoning progress indicator" },
    { id: "low-confidence-transcription", label: "Low confidence transcription" }
  ];
  var MODERATION_MODE_OPTIONS = [
    {
      id: "observation",
      label: "Response monitoring",
      description: "Monitor tool calls and responses to log potential issues. Does not change agent behavior -- data collection only."
    },
    {
      id: "respond",
      label: "Pre-response guidance",
      description: "Before the agent responds, evaluate the conversation and inject guidance to improve the answer."
    },
    {
      id: "hallucination",
      label: "Fact verification",
      description: "After the agent responds, check whether the response is supported by the available context. Flags unsupported claims for review."
    },
    {
      id: "parameter",
      label: "Tool input verification",
      description: "When the agent calls a tool, verify that extracted values match what the customer said. Retries the tool call if values are inaccurate."
    },
    {
      id: "check-bounds:silent",
      label: "Scope check \u2014 log only",
      description: "Evaluate whether the customer\u2019s request is within the agent\u2019s capabilities. Logs out-of-scope responses without changing them."
    },
    {
      id: "check-bounds:pre-check",
      label: "Scope check \u2014 correct before sending",
      description: "Evaluate whether the request is in scope. If the response goes out of bounds, correct it before the customer sees it."
    },
    {
      id: "check-bounds:post-check",
      label: "Scope check \u2014 correct after sending",
      description: "After the agent responds, check whether the response is in scope. If not, send a follow-up correction."
    }
  ];
  var PROGRESS_INDICATOR_MODE_OPTIONS = [
    { id: "personalized", label: "Personalized" },
    { id: "none", label: "None" }
  ];
  var DEFAULT_PROGRESS_INDICATORS = {
    mode: "personalized",
    trailingSilenceMs: 2e3,
    chatEnabled: false
  };
  var PERSONALITY_TRAIT_OPTIONS = [
    {
      id: "standard-customer-service",
      label: "Standard customer service",
      category: "base",
      description: "Friendly, empathetic baseline for customer service conversations.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "behavior-curious",
      label: "Curious",
      category: "behavior",
      description: "Asks simple clarifying questions when the customer is unclear.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "behavior-conclusive",
      label: "Conclusive",
      category: "behavior",
      description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "behavior-focused",
      label: "Focused",
      category: "behavior",
      description: "Redirects off-topic conversation back to the task at hand.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "voice-standard",
      label: "Voice standard",
      category: "channel",
      description: "Concise, clear endings, no markdown \u2014 optimized for voice conversations.",
      modalities: ["voice"]
    },
    {
      id: "voice-modality-context",
      label: "Voice modality context",
      category: "channel",
      description: "Provides context about audio-based conversations (transcription, interruptions, etc.).",
      modalities: ["voice"]
    },
    {
      id: "voice-long-identifiers",
      label: "Voice long identifiers",
      category: "channel",
      description: "Gracefully handle reading long identifiers (order numbers, tracking IDs, etc.) in voice.",
      modalities: ["voice"]
    },
    {
      id: "email-modality-context",
      label: "Email modality context",
      category: "channel",
      description: "Email-specific behavior: comprehensive responses in email format.",
      modalities: ["email"]
    },
    {
      id: "style-professional",
      label: "Professional",
      category: "style",
      description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "style-conversational",
      label: "Conversational",
      category: "style",
      description: "Clear, natural phrasing with contractions and simple sentence structure.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "style-colloquial",
      label: "Colloquial",
      category: "style",
      description: "Spoken phone cadence: run-on 'so'/'and' connectives, dropped sentence openers, informal affirmations, natural hedging, and occasional mid-sentence 'um'/'uh'.",
      modalities: ["voice"]
    },
    {
      id: "style-informal",
      label: "Informal",
      category: "style",
      description: "Relaxed, casual phrasing disfluencies and conversational fragments.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "style-concise",
      label: "Concise",
      category: "style",
      description: "Short sentences, most important information first, no filler or repetition.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "style-thorough",
      label: "Thorough",
      category: "style",
      description: "All essential details included, broken into clear steps or sentences.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "style-active-voice",
      label: "Active voice",
      category: "style",
      description: "Keeps you as the subject of every action \u2014 'I'll do X' not 'X will be done'.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "delivery-crisp",
      label: "Crisp",
      category: "delivery",
      description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "delivery-measured",
      label: "Measured",
      category: "delivery",
      description: "Steady, deliberate pacing using commas, em dashes, and occasional ellipses.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "delivery-expressive",
      label: "Expressive",
      category: "delivery",
      description: "Varied rhythm with emphasis punctuation to create noticeable shifts in energy.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "delivery-free",
      label: "Free",
      category: "delivery",
      description: "Relaxed conversational flow with natural pauses and occasional mid-sentence breaks.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "tone-tactful",
      label: "Tactful",
      category: "tone",
      description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "tone-empathetic",
      label: "Empathetic",
      category: "tone",
      description: "Briefly acknowledges the customer's situation before moving directly to resolution.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "tone-warm",
      label: "Warm",
      category: "tone",
      description: "Friendly, inclusive language with collaborative phrasing. Avoids cold or transactional wording.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "tone-confident",
      label: "Confident",
      category: "tone",
      description: "Clear, declarative sentences and active voice. States information directly without hedging.",
      modalities: ["voice", "chat", "email"]
    },
    {
      id: "tone-energetic",
      label: "Energetic",
      category: "tone",
      description: "Active verbs, forward momentum, and occasional exclamation points on positive outcomes.",
      modalities: ["voice", "chat", "email"]
    }
  ];
  var LOCALE_ONLY_TRAIT_ITEMS = [
    { id: "base-channel-optimization", label: "Optimize by channel" },
    { id: "style-british-wording", label: "British vocabulary" },
    { id: "style-german-wording", label: "German vocabulary" },
    { id: "style-australian-wording", label: "Australian vocabulary" },
    { id: "style-irish-wording", label: "Irish English vocabulary" },
    { id: "style-quebec-register", label: "Quebec French register" },
    { id: "style-swedish-wording", label: "Swedish vocabulary" },
    { id: "taglish-code-switching", label: "Taglish code-switching" }
  ];
  var SDK_AGENT_PERSONA_CONFIG_TRAIT_ITEMS = [
    ...PERSONALITY_TRAIT_OPTIONS.map((t) => ({ id: t.id, label: t.label })),
    ...LOCALE_ONLY_TRAIT_ITEMS
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-config.ts
  var GRAMMATICAL_GENDER_ITEMS = [
    { id: "feminine", label: "Feminine" },
    { id: "masculine", label: "Masculine" }
  ];
  var LOCALE_CODE_ITEMS = [
    // BEGIN GENERATED LOCALE_CODE_ITEMS - DO NOT EDIT
    { id: "ar-AE", label: "\u{1F1E6}\u{1F1EA} Arabic (ar-AE)" },
    { id: "es-AR", label: "\u{1F1E6}\u{1F1F7} Spanish (es-AR)" },
    { id: "en-AU", label: "\u{1F1E6}\u{1F1FA} English (en-AU)" },
    { id: "nl-BE", label: "\u{1F1E7}\u{1F1EA} Dutch (nl-BE)" },
    { id: "pt-BR", label: "\u{1F1E7}\u{1F1F7} Portuguese (pt-BR)" },
    { id: "fr-CA", label: "\u{1F1E8}\u{1F1E6} French (fr-CA)" },
    { id: "fr-CH", label: "\u{1F1E8}\u{1F1ED} French (fr-CH)" },
    { id: "zh-CN", label: "\u{1F1E8}\u{1F1F3} Chinese (zh-CN)" },
    { id: "es-CO", label: "\u{1F1E8}\u{1F1F4} Spanish (es-CO)" },
    { id: "cs-CZ", label: "\u{1F1E8}\u{1F1FF} Czech (cs-CZ)" },
    { id: "de-DE", label: "\u{1F1E9}\u{1F1EA} German (de-DE)" },
    { id: "da-DK", label: "\u{1F1E9}\u{1F1F0} Danish (da-DK)" },
    { id: "ar-EG", label: "\u{1F1EA}\u{1F1EC} Arabic (ar-EG)" },
    { id: "eu-ES", label: "\u{1F1EA}\u{1F1F8} Basque (eu-ES)" },
    { id: "ca-ES", label: "\u{1F1EA}\u{1F1F8} Catalan (ca-ES)" },
    { id: "gl-ES", label: "\u{1F1EA}\u{1F1F8} Galician (gl-ES)" },
    { id: "es-ES", label: "\u{1F1EA}\u{1F1F8} Spanish (es-ES)" },
    { id: "fi-FI", label: "\u{1F1EB}\u{1F1EE} Finnish (fi-FI)" },
    { id: "fr-FR", label: "\u{1F1EB}\u{1F1F7} French (fr-FR)" },
    { id: "en-GB", label: "\u{1F1EC}\u{1F1E7} English (en-GB)" },
    { id: "el-GR", label: "\u{1F1EC}\u{1F1F7} Greek (el-GR)" },
    { id: "zh-HK", label: "\u{1F1ED}\u{1F1F0} Chinese (zh-HK)" },
    { id: "hr-HR", label: "\u{1F1ED}\u{1F1F7} Croatian (hr-HR)" },
    { id: "hu-HU", label: "\u{1F1ED}\u{1F1FA} Hungarian (hu-HU)" },
    { id: "en-ID", label: "\u{1F1EE}\u{1F1E9} English (en-ID)" },
    { id: "id-ID", label: "\u{1F1EE}\u{1F1E9} Indonesian (id-ID)" },
    { id: "en-IE", label: "\u{1F1EE}\u{1F1EA} English (en-IE)" },
    { id: "he-IL", label: "\u{1F1EE}\u{1F1F1} Hebrew (he-IL)" },
    { id: "hi-IN", label: "\u{1F1EE}\u{1F1F3} Hindi (hi-IN)" },
    { id: "is-IS", label: "\u{1F1EE}\u{1F1F8} Icelandic (is-IS)" },
    { id: "it-IT", label: "\u{1F1EE}\u{1F1F9} Italian (it-IT)" },
    { id: "en-JM", label: "\u{1F1EF}\u{1F1F2} English (en-JM)" },
    { id: "ar-JO", label: "\u{1F1EF}\u{1F1F4} Arabic (ar-JO)" },
    { id: "ja-JP", label: "\u{1F1EF}\u{1F1F5} Japanese (ja-JP)" },
    { id: "ko-KR", label: "\u{1F1F0}\u{1F1F7} Korean (ko-KR)" },
    { id: "ar-KW", label: "\u{1F1F0}\u{1F1FC} Arabic (ar-KW)" },
    { id: "lt-LT", label: "\u{1F1F1}\u{1F1F9} Lithuanian (lt-LT)" },
    { id: "es-MX", label: "\u{1F1F2}\u{1F1FD} Spanish (es-MX)" },
    { id: "ms-MY", label: "\u{1F1F2}\u{1F1FE} Malay (ms-MY)" },
    { id: "nl-NL", label: "\u{1F1F3}\u{1F1F1} Dutch (nl-NL)" },
    { id: "nb-NO", label: "\u{1F1F3}\u{1F1F4} Norwegian (nb-NO)" },
    { id: "en-NZ", label: "\u{1F1F3}\u{1F1FF} English (en-NZ)" },
    { id: "en-PH", label: "\u{1F1F5}\u{1F1ED} English (en-PH)" },
    { id: "fil-PH", label: "\u{1F1F5}\u{1F1ED} Filipino (fil-PH)" },
    { id: "tl-PH", label: "\u{1F1F5}\u{1F1ED} Tagalog (tl-PH)" },
    { id: "pl-PL", label: "\u{1F1F5}\u{1F1F1} Polish (pl-PL)" },
    { id: "pt-PT", label: "\u{1F1F5}\u{1F1F9} Portuguese (pt-PT)" },
    { id: "ro-RO", label: "\u{1F1F7}\u{1F1F4} Romanian (ro-RO)" },
    { id: "ru-RU", label: "\u{1F1F7}\u{1F1FA} Russian (ru-RU)" },
    { id: "ar-SA", label: "\u{1F1F8}\u{1F1E6} Arabic (ar-SA)" },
    { id: "sv-SE", label: "\u{1F1F8}\u{1F1EA} Swedish (sv-SE)" },
    { id: "en-SG", label: "\u{1F1F8}\u{1F1EC} English (en-SG)" },
    { id: "sk-SK", label: "\u{1F1F8}\u{1F1F0} Slovak (sk-SK)" },
    { id: "th-TH", label: "\u{1F1F9}\u{1F1ED} Thai (th-TH)" },
    { id: "tr-TR", label: "\u{1F1F9}\u{1F1F7} Turkish (tr-TR)" },
    { id: "uk-UA", label: "\u{1F1FA}\u{1F1E6} Ukrainian (uk-UA)" },
    { id: "en-US", label: "\u{1F1FA}\u{1F1F8} English (en-US)" },
    { id: "vi-VN", label: "\u{1F1FB}\u{1F1F3} Vietnamese (vi-VN)" },
    { id: "en-ZA", label: "\u{1F1FF}\u{1F1E6} English (en-ZA)" },
    { id: "zu-ZA", label: "\u{1F1FF}\u{1F1E6} Zulu (zu-ZA)" }
    // END GENERATED LOCALE_CODE_ITEMS
  ];
  function localeObjectField({
    name,
    label,
    description
  }) {
    return defineField({
      type: "object",
      name,
      label,
      description,
      display: {
        type: "vertical"
      },
      fields: [
        defineField({
          type: "picklist",
          name: "code",
          label: "Locale",
          description: "BCP 47 locale tag",
          items: [...LOCALE_CODE_ITEMS]
        }),
        defineField({
          type: "picklist",
          name: "variant",
          label: "Variant",
          optional: true,
          items: [...GRAMMATICAL_GENDER_ITEMS]
        })
      ]
    });
  }
  function localeConfigEntry(sdkNamespace) {
    return defineConstantEntry({
      name: `${sdkNamespace}:localeConfig`,
      label: "Locale configuration",
      description: "Default and supported locales for the agent",
      icon: "chat" /* Chat */,
      type: defineType({
        name: "CoreLocaleConfig",
        fields: [
          localeObjectField({
            name: "defaultLocale",
            label: "Default locale",
            description: "BCP 47 tag used as the fallback locale for this agent"
          }),
          defineField({
            type: "array",
            name: "supportedLocales",
            label: "Supported locales",
            description: "BCP 47 tags this agent supports, in addition to the default locale.",
            childType: localeObjectField({
              name: "supportedLocale",
              label: "Supported locale"
            }),
            validation: (rule) => rule.minLength(1).error("At least one supported locale is required.")
          }),
          defineField({
            type: "checkbox",
            name: "allowVoiceLanguageSwitching",
            label: "Multilingual voice support",
            description: "Allow voice transcription in multiple configured locales.",
            optional: true
          }),
          defineField({
            type: "number",
            name: "voiceLanguageSwitchDetectionTurnThreshold",
            label: "Turns to detect a language switch",
            description: "Number of recent conversation turns inspected when deciding whether to switch the voice locale. Lower values reduce latency. Defaults to 3.",
            optional: true,
            minValue: 1
          })
        ]
      })
    });
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/voice-config-options.ts
  var MAX_OUTBOUND_START_DELAY_MS = 3e4;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-AE/shared.ts
  var arAEShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0627\u0644\u0645\u0624\u0633\u0633\u0629",
    defaultAgentName: "\u0627\u0644\u0648\u0643\u064A\u0644",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-AE/index.ts
  var feminine = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arAEShared,
    defaultVoicePersona: "fatima-al-mansoori",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u0629 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var masculine = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arAEShared,
    defaultVoicePersona: "hamdan-al-dhaheri",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u064B\u0627 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var arAE = { feminine, masculine };
  var ar_AE_default = arAE;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-EG/shared.ts
  var arEGShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0627\u0644\u0645\u0624\u0633\u0633\u0629",
    defaultAgentName: "\u0627\u0644\u0648\u0643\u064A\u0644",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-EG/index.ts
  var feminine2 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arEGShared,
    defaultVoicePersona: "salma-youssef",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u0629 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var masculine2 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arEGShared,
    defaultVoicePersona: "shakir-hassan",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u064B\u0627 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var arEG = { feminine: feminine2, masculine: masculine2 };
  var ar_EG_default = arEG;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-JO/shared.ts
  var arJOShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0627\u0644\u0645\u0624\u0633\u0633\u0629",
    defaultAgentName: "\u0627\u0644\u0648\u0643\u064A\u0644",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-JO/index.ts
  var feminine3 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arJOShared,
    defaultVoicePersona: "sara-al-fulan",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u0629 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var masculine3 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arJOShared,
    defaultVoicePersona: "sara-al-fulan",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u064B\u0627 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var arJO = { feminine: feminine3, masculine: masculine3 };
  var ar_JO_default = arJO;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-KW/shared.ts
  var arKWShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0627\u0644\u0645\u0624\u0633\u0633\u0629",
    defaultAgentName: "\u0627\u0644\u0648\u0643\u064A\u0644",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-KW/index.ts
  var feminine4 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arKWShared,
    defaultVoicePersona: "abu-al-mutairi",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u0629 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var masculine4 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arKWShared,
    defaultVoicePersona: "abu-al-mutairi",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u064B\u0627 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var arKW = { feminine: feminine4, masculine: masculine4 };
  var ar_KW_default = arKW;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-SA/shared.ts
  var arSAShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0627\u0644\u0645\u0624\u0633\u0633\u0629",
    defaultAgentName: "\u0627\u0644\u0648\u0643\u064A\u0644",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-SA/index.ts
  var feminine5 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arSAShared,
    defaultVoicePersona: "sana-al-harbi",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F\u0629 \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u0629 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var masculine5 = {
    abuseDetectedTransferMessage: "\u0633\u0623\u062D\u0648\u0651\u0644\u0643 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062F\u064A\u0646\u0627.",
    abuseDetectedTerminationMessage: "\u0623\u0639\u062A\u0630\u0631\u060C \u0644\u0643\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628.",
    ...arSAShared,
    defaultVoicePersona: "abdullah-al-qahtani",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0634\u0643\u0631\u064B\u0627 \u0644\u0627\u062A\u0635\u0627\u0644\u0643. \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F",
    errorMessage: "\u0644\u0642\u062F \u0648\u0627\u062C\u0647\u062A \u0645\u0634\u0643\u0644\u0629 \u062A\u0642\u0646\u064A\u0629. \u0623\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C.",
    inactivityPromptMessage: "\u0647\u0644 \u0645\u0627 \u0632\u0644\u062A \u0639\u0644\u0649 \u0627\u0644\u062E\u0637\u061F \u0623\u0646\u0627 \u0645\u0633\u062A\u0639\u062F \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629.",
    inactivityHangupMessage: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0646\u064A \u0644\u0645 \u0623\u062A\u0644\u0642\u0651\u064E \u0631\u062F\u064B\u0627. \u0633\u0623\u0646\u0647\u064A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629 \u0627\u0644\u0622\u0646. \u0625\u0630\u0627 \u0627\u062A\u0635\u0644\u062A \u0645\u0631\u0629 \u0623\u062E\u0631\u0649\u060C \u0641\u0633\u0623\u0643\u0648\u0646 \u0633\u0639\u064A\u062F\u064B\u0627 \u0628\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u0634\u0643\u0631\u064B\u0627."
  };
  var arSA = { feminine: feminine5, masculine: masculine5 };
  var ar_SA_default = arSA;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ca-ES/shared.ts
  var caESShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organitzaci\xF3",
    defaultAgentName: "Agent",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ca-ES/index.ts
  var feminine6 = {
    abuseDetectedTransferMessage: "Us transfereixo ara al nostre servei d'atenci\xF3 al client.",
    abuseDetectedTerminationMessage: "Em sap greu, per\xF2 no us puc ajudar amb aquesta sol\xB7licitud.",
    ...caESShared,
    defaultVoicePersona: "joana-vallverdu",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gr\xE0cies per trucar. Estic preparada per ajudar-vos. En qu\xE8 us puc ajudar avui?",
    errorMessage: "He trobat un problema t\xE8cnic. Disculpeu les mol\xE8sties.",
    inactivityPromptMessage: "Encara hi sou? Estic preparada per continuar ajudant-vos.",
    inactivityHangupMessage: "Sembla que no he rebut resposta. Tancar\xE9 la trucada de moment. Si torneu a trucar, estar\xE9 encantada d'ajudar-vos. Gr\xE0cies."
  };
  var masculine6 = {
    abuseDetectedTransferMessage: "Us transfereixo ara al nostre servei d'atenci\xF3 al client.",
    abuseDetectedTerminationMessage: "Em sap greu, per\xF2 no us puc ajudar amb aquesta sol\xB7licitud.",
    ...caESShared,
    defaultVoicePersona: "enric-soler-pujol",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gr\xE0cies per trucar. Estic preparat per ajudar-vos. En qu\xE8 us puc ajudar avui?",
    errorMessage: "He trobat un problema t\xE8cnic. Disculpeu les mol\xE8sties.",
    inactivityPromptMessage: "Encara hi sou? Estic preparat per continuar ajudant-vos.",
    inactivityHangupMessage: "Sembla que no he rebut resposta. Tancar\xE9 la trucada de moment. Si torneu a trucar, estar\xE9 encantat d'ajudar-vos. Gr\xE0cies."
  };
  var caES = { feminine: feminine6, masculine: masculine6 };
  var ca_ES_default = caES;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/cs-CZ/shared.ts
  var csCZShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizace",
    defaultAgentName: "Agent",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/cs-CZ/index.ts
  var feminine7 = {
    abuseDetectedTransferMessage: "Nyn\xED v\xE1s p\u0159epojuji na z\xE1kaznickou podporu.",
    abuseDetectedTerminationMessage: "Je mi l\xEDto, ale s t\xEDmto po\u017Eadavkem v\xE1m nemohu pomoci.",
    ...csCZShared,
    defaultVoicePersona: "denisa-novotna",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dobr\xFD den, d\u011Bkuji za zavol\xE1n\xED. Jsem p\u0159ipravena pomoci. Jak v\xE1m dnes mohu pomoci?",
    errorMessage: "Do\u0161lo k technick\xE9mu probl\xE9mu. Omlouv\xE1m se za komplikace.",
    inactivityPromptMessage: "Jste st\xE1le na lince? Jsem p\u0159ipravena pokra\u010Dovat a pomoci.",
    inactivityHangupMessage: "Vypad\xE1 to, \u017Ee jsem nedostala odpov\u011B\u010F. Hovor pro tuto chv\xEDli ukon\u010D\xEDm. Pokud zavol\xE1te znovu, r\xE1da pomohu. D\u011Bkuji."
  };
  var masculine7 = {
    abuseDetectedTransferMessage: "Nyn\xED v\xE1s p\u0159epojuji na z\xE1kaznickou podporu.",
    abuseDetectedTerminationMessage: "Je mi l\xEDto, ale s t\xEDmto po\u017Eadavkem v\xE1m nemohu pomoci.",
    ...csCZShared,
    defaultVoicePersona: "adam-kucera",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dobr\xFD den, d\u011Bkuji za zavol\xE1n\xED. Jsem p\u0159ipraven pomoci. Jak v\xE1m dnes mohu pomoci?",
    errorMessage: "Do\u0161lo k technick\xE9mu probl\xE9mu. Omlouv\xE1m se za komplikace.",
    inactivityPromptMessage: "Jste st\xE1le na lince? Jsem p\u0159ipraven pokra\u010Dovat a pomoci.",
    inactivityHangupMessage: "Vypad\xE1 to, \u017Ee jsem nedostal odpov\u011B\u010F. Hovor pro tuto chv\xEDli ukon\u010D\xEDm. Pokud zavol\xE1te znovu, r\xE1d pomohu. D\u011Bkuji."
  };
  var csCZ = { feminine: feminine7, masculine: masculine7 };
  var cs_CZ_default = csCZ;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/da-DK/index.ts
  var daDK = {
    abuseDetectedTransferMessage: "Jeg stiller dig om til kundeservice nu.",
    abuseDetectedTerminationMessage: "Det er jeg ked af, men det kan jeg ikke hj\xE6lpe med.",
    defaultVoicePersona: "freja-madsen",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hej, tak for dit opkald. Hvordan kan jeg hj\xE6lpe dig i dag?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisation",
    defaultAgentName: "Agent",
    errorMessage: "Jeg er st\xF8dt p\xE5 et teknisk problem. Beklager ulejligheden.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Er du der stadig? Jeg er her, hvis du stadig har brug for hj\xE6lp.",
    inactivityHangupMessage: "Det lader til, at jeg ikke har f\xE5et svar, s\xE5 jeg afslutter opkaldet nu. Tak for dit opkald.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var da_DK_default = daDK;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/de-DE/index.ts
  var deDE = {
    abuseDetectedTransferMessage: "Ich verbinde Sie jetzt mit unserem Kundenservice.",
    abuseDetectedTerminationMessage: "Es tut mir leid, aber dabei kann ich Ihnen nicht helfen.",
    defaultVoicePersona: "ela-sommer",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Guten Tag, vielen Dank f\xFCr Ihren Anruf. Wie kann ich Ihnen helfen?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisation",
    defaultAgentName: "Agent",
    errorMessage: "Bei mir ist ein technisches Problem aufgetreten. Entschuldigen Sie bitte die Unannehmlichkeiten.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Sind Sie noch da? Ich helfe Ihnen gerne weiter.",
    inactivityHangupMessage: "Da ich keine Antwort erhalten habe, beende ich jetzt das Gespr\xE4ch. Vielen Dank f\xFCr Ihren Anruf und einen sch\xF6nen Tag noch.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-german-wording",
      "tone-warm",
      "behavior-conclusive",
      "delivery-expressive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        category: "base",
        description: "Polite, calm, empathetic baseline for customer service conversations.",
        promptContent: [
          "Be polite, calm, and empathetic.",
          "Avoid being overly apologetic or overly enthusiastic. Do not use unnecessary exclamation marks.",
          "Do not repeat information unless the user's responses indicate they have not understood."
        ]
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "behavior-curious",
        label: "Inquisitive",
        category: "behavior",
        exclusiveGroup: "behavior-posture",
        description: "Asks simple clarifying questions when the customer is unclear.",
        promptContent: [
          "When the user is unclear or stuck, ask simple clarifying questions where needed.",
          "When asking clarifying questions, prefer yes/no questions where appropriate."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior",
        exclusiveGroup: "behavior-posture"
      },
      {
        id: "style-german-wording",
        label: "German vocabulary",
        category: "behavior",
        description: "German vocabulary and phrasing conventions for customer service.",
        promptContent: [
          "Use natural German spelling, vocabulary, and phrasing throughout whenever speaking German.",
          "Always address the customer with the formal 'Sie' (Siezen), never 'du', unless explicitly instructed otherwise. Use the corresponding possessive forms ('Ihr', 'Ihre') and verb conjugations ('k\xF6nnen Sie', 'm\xF6chten Sie', 'haben Sie').",
          "Use German customer-service vocabulary: 'Kundenservice' (not 'Customer Service'), 'Bestellnummer', 'Rechnungsnummer', 'Postleitzahl', and 'E-Mail-Adresse'.",
          "Format numeric dates as dd.mm.yyyy (e.g. '24.06.2021') and read them in natural German. Use the nominative form for standalone dates (e.g. 'der vierundzwanzigste Juni zweitausendeinundzwanzig') and the dative form after prepositions (e.g. 'am vierundzwanzigsten Juni zweitausendeinundzwanzig').",
          "Format numbers in the German convention with a period as the thousands separator and a comma as the decimal separator (e.g. '1.234,56').",
          "Format euro amounts in the German convention with the amount before the symbol and a comma decimal (e.g. '1.234,56 \u20AC'), and read them as '... Euro ... Cent'.",
          "Read German phone numbers back in natural groupings rather than as one long run of digits, using 'null' for zero.",
          "Use polite German question forms such as 'K\xF6nnen Sie mir sagen \u2026?' or 'W\xFCrden Sie mir bitte \u2026 nennen?' when requesting information.",
          "Avoid English filler or anglicised wording unless quoting a customer name or a fixed external term."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        category: "delivery",
        exclusiveGroup: "delivery-cadence",
        description: "Varied rhythm with restrained emphasis.",
        promptContent: [
          "Vary sentence length to create a natural rhythm.",
          "Use filler words sparingly when confirming information (1-2 words only). Common confirmation filler words include: 'Gut', 'Perfekt', and 'Danke'.",
          "Avoid explicit filler words such as '\xE4hm' or '\xE4h' unless clearly necessary."
        ]
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Friendly, inclusive language with collaborative phrasing. Avoids cold or transactional wording.",
        promptContent: [
          "Use collaborative language selectively, such as 'ich schaue mir das gern mit Ihnen an' or 'wir pr\xFCfen das gemeinsam'. Limit to one or two instances per response and don't repeat across consecutive sentences.",
          "Acknowledge the customer's situation in one concise, neutral sentence before moving to a resolution. Avoid exaggeration or assumed emotion.",
          "Example (good): 'Ich sehe, dass die Zahlung nicht durchgegangen ist \u2014 ich schaue mir gern mit Ihnen an, woran es liegt.'",
          "Example (avoid): 'Ich verstehe vollkommen, wie frustrierend das f\xFCr Sie sein muss!'",
          "Express warmth through inclusion and care rather than enthusiasm. No exclamation marks unless explicitly instructed otherwise."
        ]
      }
    ]
  };
  var de_DE_default = deDE;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/el-GR/shared.ts
  var elGRShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u039F\u03C1\u03B3\u03B1\u03BD\u03B9\u03C3\u03BC\u03CC\u03C2",
    defaultAgentName: "\u03A0\u03C1\u03AC\u03BA\u03C4\u03BF\u03C1\u03B1\u03C2",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/el-GR/index.ts
  var feminine8 = {
    abuseDetectedTransferMessage: "\u03A3\u03B1\u03C2 \u03C3\u03C5\u03BD\u03B4\u03AD\u03C9 \u03C4\u03CE\u03C1\u03B1 \u03BC\u03B5 \u03C4\u03B7\u03BD \u03B5\u03BE\u03C5\u03C0\u03B7\u03C1\u03AD\u03C4\u03B7\u03C3\u03B7 \u03C0\u03B5\u03BB\u03B1\u03C4\u03CE\u03BD.",
    abuseDetectedTerminationMessage: "\u039B\u03C5\u03C0\u03AC\u03BC\u03B1\u03B9, \u03B1\u03BB\u03BB\u03AC \u03B4\u03B5\u03BD \u03BC\u03C0\u03BF\u03C1\u03CE \u03BD\u03B1 \u03C3\u03B1\u03C2 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9 \u03BC\u03B5 \u03B1\u03C5\u03C4\u03CC \u03C4\u03BF \u03B1\u03AF\u03C4\u03B7\u03BC\u03B1.",
    ...elGRShared,
    defaultVoicePersona: "sofia-papadopoulou",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0393\u03B5\u03B9\u03B1 \u03C3\u03B1\u03C2, \u03B5\u03C5\u03C7\u03B1\u03C1\u03B9\u03C3\u03C4\u03CE \u03C0\u03BF\u03C5 \u03BA\u03B1\u03BB\u03AD\u03C3\u03B1\u03C4\u03B5. \u0395\u03AF\u03BC\u03B1\u03B9 \u03AD\u03C4\u03BF\u03B9\u03BC\u03B7 \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9. \u03A0\u03CE\u03C2 \u03BC\u03C0\u03BF\u03C1\u03CE \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9 \u03C3\u03AE\u03BC\u03B5\u03C1\u03B1;",
    errorMessage: "\u03A0\u03B1\u03C1\u03BF\u03C5\u03C3\u03B9\u03AC\u03C3\u03C4\u03B7\u03BA\u03B5 \u03AD\u03BD\u03B1 \u03C4\u03B5\u03C7\u03BD\u03B9\u03BA\u03CC \u03C0\u03C1\u03CC\u03B2\u03BB\u03B7\u03BC\u03B1. \u0396\u03B7\u03C4\u03CE \u03C3\u03C5\u03B3\u03B3\u03BD\u03CE\u03BC\u03B7 \u03B3\u03B9\u03B1 \u03C4\u03B7\u03BD \u03B1\u03BD\u03B1\u03C3\u03C4\u03AC\u03C4\u03C9\u03C3\u03B7.",
    inactivityPromptMessage: "\u0395\u03AF\u03C3\u03C4\u03B5 \u03B1\u03BA\u03CC\u03BC\u03B7 \u03B5\u03BA\u03B5\u03AF; \u0395\u03AF\u03BC\u03B1\u03B9 \u03AD\u03C4\u03BF\u03B9\u03BC\u03B7 \u03BD\u03B1 \u03C3\u03C5\u03BD\u03B5\u03C7\u03AF\u03C3\u03C9 \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03CE.",
    inactivityHangupMessage: "\u03A6\u03B1\u03AF\u03BD\u03B5\u03C4\u03B1\u03B9 \u03C0\u03C9\u03C2 \u03B4\u03B5\u03BD \u03AD\u03BB\u03B1\u03B2\u03B1 \u03B1\u03C0\u03AC\u03BD\u03C4\u03B7\u03C3\u03B7. \u0398\u03B1 \u03C4\u03B5\u03C1\u03BC\u03B1\u03C4\u03AF\u03C3\u03C9 \u03C4\u03B7\u03BD \u03BA\u03BB\u03AE\u03C3\u03B7 \u03C0\u03C1\u03BF\u03C2 \u03C4\u03BF \u03C0\u03B1\u03C1\u03CC\u03BD. \u0391\u03BD \u03BA\u03B1\u03BB\u03AD\u03C3\u03B5\u03C4\u03B5 \u03BE\u03B1\u03BD\u03AC, \u03B8\u03B1 \u03B5\u03AF\u03BC\u03B1\u03B9 \u03C7\u03B1\u03C1\u03BF\u03CD\u03BC\u03B5\u03BD\u03B7 \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9. \u0395\u03C5\u03C7\u03B1\u03C1\u03B9\u03C3\u03C4\u03CE."
  };
  var masculine8 = {
    abuseDetectedTransferMessage: "\u03A3\u03B1\u03C2 \u03C3\u03C5\u03BD\u03B4\u03AD\u03C9 \u03C4\u03CE\u03C1\u03B1 \u03BC\u03B5 \u03C4\u03B7\u03BD \u03B5\u03BE\u03C5\u03C0\u03B7\u03C1\u03AD\u03C4\u03B7\u03C3\u03B7 \u03C0\u03B5\u03BB\u03B1\u03C4\u03CE\u03BD.",
    abuseDetectedTerminationMessage: "\u039B\u03C5\u03C0\u03AC\u03BC\u03B1\u03B9, \u03B1\u03BB\u03BB\u03AC \u03B4\u03B5\u03BD \u03BC\u03C0\u03BF\u03C1\u03CE \u03BD\u03B1 \u03C3\u03B1\u03C2 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9 \u03BC\u03B5 \u03B1\u03C5\u03C4\u03CC \u03C4\u03BF \u03B1\u03AF\u03C4\u03B7\u03BC\u03B1.",
    ...elGRShared,
    defaultVoicePersona: "theos-nikolakopoulos",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0393\u03B5\u03B9\u03B1 \u03C3\u03B1\u03C2, \u03B5\u03C5\u03C7\u03B1\u03C1\u03B9\u03C3\u03C4\u03CE \u03C0\u03BF\u03C5 \u03BA\u03B1\u03BB\u03AD\u03C3\u03B1\u03C4\u03B5. \u0395\u03AF\u03BC\u03B1\u03B9 \u03AD\u03C4\u03BF\u03B9\u03BC\u03BF\u03C2 \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9. \u03A0\u03CE\u03C2 \u03BC\u03C0\u03BF\u03C1\u03CE \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9 \u03C3\u03AE\u03BC\u03B5\u03C1\u03B1;",
    errorMessage: "\u03A0\u03B1\u03C1\u03BF\u03C5\u03C3\u03B9\u03AC\u03C3\u03C4\u03B7\u03BA\u03B5 \u03AD\u03BD\u03B1 \u03C4\u03B5\u03C7\u03BD\u03B9\u03BA\u03CC \u03C0\u03C1\u03CC\u03B2\u03BB\u03B7\u03BC\u03B1. \u0396\u03B7\u03C4\u03CE \u03C3\u03C5\u03B3\u03B3\u03BD\u03CE\u03BC\u03B7 \u03B3\u03B9\u03B1 \u03C4\u03B7\u03BD \u03B1\u03BD\u03B1\u03C3\u03C4\u03AC\u03C4\u03C9\u03C3\u03B7.",
    inactivityPromptMessage: "\u0395\u03AF\u03C3\u03C4\u03B5 \u03B1\u03BA\u03CC\u03BC\u03B7 \u03B5\u03BA\u03B5\u03AF; \u0395\u03AF\u03BC\u03B1\u03B9 \u03AD\u03C4\u03BF\u03B9\u03BC\u03BF\u03C2 \u03BD\u03B1 \u03C3\u03C5\u03BD\u03B5\u03C7\u03AF\u03C3\u03C9 \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03CE.",
    inactivityHangupMessage: "\u03A6\u03B1\u03AF\u03BD\u03B5\u03C4\u03B1\u03B9 \u03C0\u03C9\u03C2 \u03B4\u03B5\u03BD \u03AD\u03BB\u03B1\u03B2\u03B1 \u03B1\u03C0\u03AC\u03BD\u03C4\u03B7\u03C3\u03B7. \u0398\u03B1 \u03C4\u03B5\u03C1\u03BC\u03B1\u03C4\u03AF\u03C3\u03C9 \u03C4\u03B7\u03BD \u03BA\u03BB\u03AE\u03C3\u03B7 \u03C0\u03C1\u03BF\u03C2 \u03C4\u03BF \u03C0\u03B1\u03C1\u03CC\u03BD. \u0391\u03BD \u03BA\u03B1\u03BB\u03AD\u03C3\u03B5\u03C4\u03B5 \u03BE\u03B1\u03BD\u03AC, \u03B8\u03B1 \u03B5\u03AF\u03BC\u03B1\u03B9 \u03C7\u03B1\u03C1\u03BF\u03CD\u03BC\u03B5\u03BD\u03BF\u03C2 \u03BD\u03B1 \u03B2\u03BF\u03B7\u03B8\u03AE\u03C3\u03C9. \u0395\u03C5\u03C7\u03B1\u03C1\u03B9\u03C3\u03C4\u03CE."
  };
  var elGR = { feminine: feminine8, masculine: masculine8 };
  var el_GR_default = elGR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/index.ts
  var enAU = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "Sorry, I can't help with that.",
    defaultVoicePersona: "esther-van-doornum-v2",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "Sorry about that, I've hit a technical problem.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here if you still need a hand.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thanks for calling.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-australian-wording",
      "tone-warm",
      "behavior-conclusive",
      "delivery-expressive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        category: "base",
        description: "Warm, calm, empathetic baseline for customer service conversations.",
        promptContent: [
          "Be warm, calm, and empathetic.",
          "Avoid being overly apologetic or overly enthusiastic. Do not use unnecessary exclamation marks.",
          "Do not repeat information unless the user's responses indicate they have not understood."
        ]
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "behavior-curious",
        label: "Curious",
        category: "behavior",
        description: "Asks simple clarifying questions when the customer is unclear.",
        promptContent: [
          "When the user is unclear or stuck, ask simple clarifying questions where needed.",
          "When asking clarifying questions, prefer yes/no questions where appropriate."
        ]
      },
      {
        id: "behavior-focused",
        label: "Focused",
        category: "behavior",
        description: "Politely redirects off-topic conversation back to the task at hand.",
        promptContent: [
          "Stay focused on goals. If the user raises something unrelated, politely redirect to what you can concretely help with."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior"
      },
      {
        id: "style-active-voice",
        label: "Active voice",
        description: "Keeps you as the subject of every action \u2014 'I'll do X' not 'X will be done'.",
        personalityTraitIDs: ["style-active-voice"],
        category: "behavior"
      },
      {
        id: "style-australian-wording",
        label: "Australian vocabulary",
        category: "behavior",
        description: "Australian English spelling, vocabulary, and phrasing conventions.",
        promptContent: [
          "Use Australian English spelling, vocabulary, and phrasing throughout whenever speaking English.",
          "Use Australian spellings such as 'colour', 'centre', 'organisation', 'realise', 'recognise', 'enrolment', and 'licence' (noun) versus 'license' (verb).",
          "Prefer Australian terms such as 'rego' (vehicle registration), 'petrol', 'footpath', 'mum', 'rubbish', 'fortnight', 'super' (superannuation), and 'eftpos' rather than American alternatives.",
          "Format numeric dates as dd/mm/yyyy.",
          "Write Australian mobile numbers in the local 04XX XXX XXX form.",
          "Use natural Australian support phrasing. Light acknowledgments such as 'no worries', 'no problem', 'happy to help', or 'all sorted' are appropriate; use them sparingly.",
          "Do not use stereotype phrases such as 'g'day', 'mate', 'cheers', or 'ta' in default responses; these read as performative rather than natural.",
          "Avoid American English wording and spelling (such as 'trash', 'gas', 'cell phone', 'vacation', 'color', 'center') unless quoting the customer or a fixed external term."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        description: "All essential details included, broken into clear steps or sentences.",
        personalityTraitIDs: ["style-thorough"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        category: "delivery",
        exclusiveGroup: "delivery-cadence",
        description: "Varied rhythm with restrained emphasis.",
        promptContent: [
          "Vary sentence length to create a natural rhythm.",
          "When repeating long strings of digits, split into blocks of 2-3 digits each, with pauses between each block. Read each digit individually.",
          "Avoid explicit filler words such as 'um' or 'uh' unless clearly necessary."
        ]
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Inclusive language that expresses care through clarity rather than enthusiasm.",
        promptContent: [
          "Use inclusive language such as 'we' or 'let's' where it feels natural, but do not overuse it.",
          "Express care through clarity and helpfulness rather than enthusiasm."
        ]
      }
    ]
  };
  var en_AU_default = enAU;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-GB/index.ts
  var enGB = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "maeve-caldwell",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thank you for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm still here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you for calling.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-british-wording",
      "tone-warm",
      "behavior-conclusive",
      "delivery-expressive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        category: "base",
        description: "Polite, calm, empathetic baseline for customer service conversations.",
        promptContent: [
          "Be polite, calm, and empathetic.",
          "Avoid being overly apologetic or overly enthusiastic. Do not use unnecessary exclamation marks.",
          "Do not repeat information unless the user's responses indicate they have not understood."
        ]
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "behavior-curious",
        label: "Inquisitive",
        category: "behavior",
        exclusiveGroup: "behavior-posture",
        description: "Asks simple clarifying questions when the customer is unclear.",
        promptContent: [
          "When the user is unclear or stuck, ask simple clarifying questions where needed.",
          "When asking clarifying questions, prefer yes/no questions where appropriate."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior",
        exclusiveGroup: "behavior-posture"
      },
      {
        id: "style-british-wording",
        label: "British vocabulary",
        category: "behavior",
        description: "British English vocabulary and phrasing conventions.",
        promptContent: [
          "Use British English spelling, vocabulary, and phrasing throughout whenever speaking English.",
          "Prefer UK terms such as 'windscreen', 'postcode', and 'number plate' rather than US alternatives.",
          "Format and normalise numeric dates as dd/mm/yyyy.",
          "Always express times in 12-hour format with am or pm (e.g. '3pm', '10:30am'), not 24-hour format.",
          "Always write phone numbers in canonical format so the system reads them aloud correctly: local numbers as 11 digits starting with 0 (e.g. '07790457890'), or with an international prefix followed by 10 digits (e.g. '+447890627898' or '00447890627898'). Normalise regardless of how the customer provides them.",
          // pragma: allowlist secret
          "Always normalise postcodes and National Insurance numbers to their canonical format \u2014 the system uses these exact formats to read them aloud correctly, regardless of how the customer provides them (spoken, typed, run-on, or with unusual spacing): postcodes as outward code, a single space, then inward code (e.g. 'BS1 4DJ'); NI numbers as two letters, six digits, then a suffix letter, with no spaces (e.g. 'AB123456C').",
          // pragma: allowlist secret
          "Use natural UK support phrasing, including polite question forms such as 'Can you tell me...?' or 'Would you mind sharing...?' when requesting information.",
          "When a brief apology is needed, prefer phrasing such as 'I'm sorry about that' over more abrupt alternatives.",
          "Use elliptical replies ('It won't,' 'Fortunately...,' and 'Unfortunately...', 'Not quite') when there is an action you are sharing with the customer.",
          "Avoid American English wording, spelling, and date conventions unless quoting the customer name or a fixed external term."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        category: "verbosity",
        exclusiveGroup: "style-detail",
        description: "Tell the customer everything you are going to do in sequence.",
        promptContent: [
          "Go beyond what was asked: address every condition, exception, and next step the {{customerNoun}} will encounter.",
          "Be explicit about sequence \u2014 spell out what happens first, what follows, and what to expect."
        ]
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        category: "delivery",
        exclusiveGroup: "delivery-cadence",
        description: "Varied rhythm with restrained emphasis.",
        promptContent: [
          "Vary sentence length to create a natural rhythm.",
          "Use filler words sparingly when confirming information (1-2 words only). Common confirmation filler words include: 'Great', 'Perfect', and 'Thanks'.",
          "Avoid explicit filler words such as 'um' or 'uh' unless clearly necessary."
        ]
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Friendly, inclusive language with collaborative phrasing. Avoids cold or transactional wording.",
        promptContent: [
          "Use inclusive language selectively: 'we' for shared ownership, 'let's' when suggesting next steps. Limit to one or two instances per response and don't repeat across consecutive sentences.",
          "Use contractions where they sound natural in spoken British English ('I'll', 'we'll', 'you're', 'don't'). Avoid stiff alternatives like 'I will' or 'do not' unless the surrounding response is deliberately formal.",
          "Acknowledge the customer's situation in one concise, neutral sentence before moving to a resolution. Avoid exaggeration or assumed emotion.",
          "Example (good): 'I can see the payment didn't go through \u2014 let's take a look at what's blocking it.'",
          "Example (avoid): 'I completely understand how frustrating this must be for you!'",
          "Express warmth through inclusion and care rather than enthusiasm. No exclamation marks unless explicitly instructed otherwise."
        ]
      }
    ]
  };
  var en_GB_default = enGB;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-IE/index.ts
  var enIE = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "labhaoise-callaghan",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thanks for calling.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-irish-wording",
      "tone-warm",
      "behavior-conclusive",
      "delivery-expressive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        category: "base",
        description: "Polite, calm, empathetic baseline for customer service conversations.",
        promptContent: [
          "Be polite, calm, and empathetic.",
          "Avoid being overly apologetic or overly enthusiastic. Do not use unnecessary exclamation marks.",
          "Do not repeat information unless the user's responses indicate they have not understood."
        ]
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "behavior-curious",
        label: "Inquisitive",
        category: "behavior",
        exclusiveGroup: "behavior-posture",
        description: "Asks simple clarifying questions when the customer is unclear.",
        promptContent: [
          "When the user is unclear or stuck, ask simple clarifying questions where needed.",
          "When asking clarifying questions, prefer yes/no questions where appropriate."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior",
        exclusiveGroup: "behavior-posture"
      },
      {
        id: "style-irish-wording",
        label: "Irish English vocabulary",
        category: "behavior",
        description: "Irish English vocabulary and phrasing conventions.",
        promptContent: [
          "Use Irish English spelling, vocabulary, and phrasing throughout whenever speaking English.",
          "Prefer Irish terms such as 'Eircode' (not 'postcode'), 'PPS number' or 'PPSN' (not 'NI number'), and 'mobile' (not 'cell phone').",
          "Refer to currency as 'euro' and 'cent', not 'pounds' and 'pence', unless the customer is using sterling.",
          "Format and normalise numeric dates as dd/mm/yyyy.",
          "Always express times in 12-hour format with am or pm (e.g. '3pm', '10:30am'), not 24-hour format.",
          "Always write phone numbers in canonical format so the system reads them aloud correctly: local numbers as 10 digits starting with 0 (e.g. '0831234567'), or with the international prefix +353 followed by 9 digits (e.g. '+353831234567'). Normalise regardless of how the customer provides them.",
          "Always normalise Eircodes and PPS numbers to their canonical format \u2014 the system uses these exact formats to read them aloud correctly, regardless of how the customer provides them (spoken, typed, run-on, or with unusual spacing): Eircodes as a three-character routing key, a single space, then four characters (e.g. 'D02 X285'); PPS numbers as seven digits followed by one or two letters, with no spaces (e.g. '1234567T' or '1234567TA').",
          "Use natural Irish phrasing \u2014 polite question forms ('Could you tell me...?', 'Would you mind sharing...?') and warm acknowledgements ('Grand', 'No bother', 'Of course') where they fit naturally.",
          "When a brief apology is needed, prefer 'I'm sorry about that' or 'Apologies for that' over abrupt alternatives.",
          "Avoid American English wording, spelling, and date conventions unless quoting the customer name or a fixed external term."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        category: "verbosity",
        exclusiveGroup: "style-detail",
        description: "Tell the customer everything you are going to do in sequence.",
        promptContent: [
          "Go beyond what was asked: address every condition, exception, and next step the {{customerNoun}} will encounter.",
          "Be explicit about sequence \u2014 spell out what happens first, what follows, and what to expect."
        ]
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        category: "delivery",
        exclusiveGroup: "delivery-cadence",
        description: "Varied rhythm with restrained emphasis.",
        promptContent: [
          "Vary sentence length to create a natural rhythm.",
          "Use filler words sparingly when confirming information (1-2 words only). Common confirmation filler words include: 'Great', 'Perfect', and 'Thanks'.",
          "Avoid explicit filler words such as 'um' or 'uh' unless clearly necessary."
        ]
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Friendly, inclusive language with collaborative phrasing. Avoids cold or transactional wording.",
        promptContent: [
          "Use inclusive language selectively: 'we' for shared ownership, 'let's' when suggesting next steps. Limit to one or two instances per response and don't repeat across consecutive sentences.",
          "Use contractions where they sound natural in spoken Irish English ('I'll', 'we'll', 'you're', 'don't'). Avoid stiff alternatives like 'I will' or 'do not' unless the surrounding response is deliberately formal.",
          "Acknowledge the customer's situation in one concise, neutral sentence before moving to a resolution. Avoid exaggeration or assumed emotion.",
          "Example (good): 'I can see the payment didn't go through \u2014 let's take a look at what's blocking it.'",
          "Example (avoid): 'I completely understand how frustrating this must be for you!'",
          "Express warmth through inclusion and care rather than enthusiasm. No exclamation marks unless explicitly instructed otherwise."
        ]
      }
    ]
  };
  var en_IE_default = enIE;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-ID/index.ts
  var enID = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultVoicePersona: "nisrina-salsabila-en",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var en_ID_default = enID;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-JM/index.ts
  var enJM = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "damani-powell",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var en_JM_default = enJM;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-NZ/index.ts
  var enNZ = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "liam-carter",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var en_NZ_default = enNZ;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-PH/index.ts
  var enPH = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "margarita-soriano",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var en_PH_default = enPH;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-SG/shared.ts
  var EN_SG_DEFAULT_KEYWORDS = [
    "Chinese",
    "Malay",
    "Mandarin",
    "Tamil",
    "FIN",
    "NRIC",
    "PR",
    "EP",
    "S Pass",
    "lor",
    "leh",
    "meh",
    "sia",
    "wah",
    "hor",
    "can",
    "PayNow",
    "PayLah",
    "NETS",
    "EZ-Link",
    "Medisave",
    "Medishield",
    "CPF",
    "GST",
    "GIRO",
    "SingPass",
    "MyInfo",
    "OneService",
    "SkillsFuture",
    "void deck",
    "MRT",
    "LRT",
    "OTP"
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-SG/index.ts
  var enSG = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "elisa-ng-quick",
    defaultVoiceKeywords: EN_SG_DEFAULT_KEYWORDS,
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var en_SG_default = enSG;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-US/index.ts
  var enUS = {
    abuseDetectedTransferMessage: "I'm transferring you to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "jade-hardy",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "behavior-conclusive",
      "style-conversational"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      },
      {
        id: "behavior-curious",
        label: "Curious",
        description: "Asks simple clarifying questions when the customer is unclear.",
        personalityTraitIDs: ["behavior-curious"],
        category: "behavior"
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior"
      },
      {
        id: "behavior-focused",
        label: "Focused",
        description: "Redirects off-topic conversation back to the task at hand.",
        personalityTraitIDs: ["behavior-focused"],
        category: "behavior"
      },
      {
        id: "style-active-voice",
        label: "Active voice",
        description: "Keeps you as the subject of every action \u2014 'I'll do X' not 'X will be done'.",
        personalityTraitIDs: ["style-active-voice"],
        category: "behavior"
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register",
        progressIndicatorPrompt: "Use polished and courteous language: steady pacing, no slang, no overly casual fillers."
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register",
        progressIndicatorPrompt: "Use clear and approachable language: natural spoken English, still professional."
      },
      {
        id: "style-colloquial",
        label: "Colloquial",
        description: "Relaxed, informal phrasing. In voice, uses disfluencies and punctuation to mirror realistic human speech.",
        category: "demeanor",
        exclusiveGroup: "style-register",
        promptContentByChannel: {
          voice: [
            "Write like a real live support agent speaking in real time, not like polished written prose.",
            "Prefer short spoken clauses over fully polished sentences. Sentence fragments are fine when they still sound clear and natural.",
            "When two ideas are closely related, often connect them with simple spoken transitions like 'so', 'and', 'but', or 'because' instead of splitting them into more formal separate sentences. Do not force this every time.",
            "Drop unnecessary formal phrasing. Prefer things like 'Looks like...', 'Sounds good', 'One sec', 'Yep', 'Alright', 'Perfect', and 'Sure'.",
            "Use disfluencies sparingly and naturally. Occasional 'um', 'uh', or 'hmm' can help when hesitating, softening, or buying time, but do not overuse them.",
            "Use punctuation to reflect speech rhythm, not to decorate the text. Prefer commas, em dashes, and ellipses occasionally for pauses or self-corrections.",
            "Avoid stylized or overly written punctuation choices that do not sound like speech, including semicolons, repeated punctuation like '??' or '!!', and excessive exclamation points.",
            "Keep important facts clean and direct. Prices, dates, policies, next steps, and confirmations should be stated clearly even when the surrounding phrasing is conversational.",
            "Allow light self-corrections and restarts when they sound natural, such as 'so for that one - actually, let me check' or 'it's going to be $100, and that's just for the visit'.",
            "Avoid polished assistant or corporate phrasing such as 'Certainly', 'I'd be happy to help', 'Based on the information provided', or 'Please be advised'.",
            "Aim for casual, responsive, slightly imperfect spoken rhythm while still sounding competent, clear, and easy to follow. Use ellipses to control pacing."
          ],
          text: [
            "Use relaxed, casual language that resembles everyday conversation.",
            "Allow short fragments and conversational sentence structure."
          ]
        },
        progressIndicatorPrompt: "Use relaxed language that someone would use when speaking: short clauses, light disfluency or ellipses only when it still sounds like a live agent."
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        description: "All essential details included, broken into clear steps or sentences.",
        personalityTraitIDs: ["style-thorough"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-measured",
        label: "Measured",
        description: "Steady, deliberate pacing using commas, em dashes, and occasional ellipses.",
        personalityTraitIDs: ["delivery-measured"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        description: "Varied rhythm with emphasis punctuation to create noticeable shifts in energy.",
        personalityTraitIDs: ["delivery-expressive"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-free",
        label: "Free",
        description: "Relaxed conversational flow with natural pauses and occasional mid-sentence breaks.",
        personalityTraitIDs: ["delivery-free"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-empathetic",
        label: "Empathetic",
        description: "Briefly acknowledges the customer's situation before moving directly to resolution.",
        personalityTraitIDs: ["tone-empathetic"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        description: "Friendly, inclusive language with collaborative phrasing. Avoids cold or transactional wording.",
        category: "tone",
        exclusiveGroup: "tone-posture",
        promptContent: [
          "Use inclusive language selectively: 'let's' when suggesting next steps, 'we' for shared ownership. Avoid 'together' unless describing an actual joint process.",
          "Limit inclusive phrasing to 1-2 instances per response and avoid repeating it across consecutive sentences.",
          "Acknowledge the user\u2019s situation in one concise sentence using neutral, supportive language. Avoid exaggeration or emotional assumptions.",
          "Example (good): 'I see the charge didn\u2019t go through...let\u2019s take a look at what\u2019s blocking it.'",
          "Example (avoid): 'I totally understand how frustrating this must be for you.'"
        ]
      },
      {
        id: "tone-confident",
        label: "Confident",
        description: "Clear, declarative sentences and active voice. States information directly without hedging.",
        personalityTraitIDs: ["tone-confident"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-energetic",
        label: "Energetic",
        description: "Active verbs, forward momentum, and occasional exclamation points on positive outcomes.",
        personalityTraitIDs: ["tone-energetic"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      }
    ]
  };
  var en_US_default = enUS;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-ZA/index.ts
  var SOUTH_AFRICAN_ENGLISH_RESPONSE_TRAITS = [
    {
      id: "standard-customer-service",
      label: "Standard customer service",
      description: "Friendly, empathetic baseline for customer service conversations.",
      personalityTraitIDs: ["standard-customer-service"],
      category: "base"
    },
    {
      id: "base-channel-optimization",
      personalityTraitIDs: [
        "voice-standard",
        "voice-modality-context",
        "voice-long-identifiers",
        "email-modality-context"
      ],
      label: "Optimize by channel",
      category: "base",
      description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
    },
    {
      id: "style-south-african-english",
      label: "South African English",
      category: "behavior",
      description: "Light South African English spelling, vocabulary, and phrasing guidance.",
      promptContent: [
        "Use South African English spelling, vocabulary, and phrasing whenever speaking English.",
        "Use South African English spelling, such as 'colour', 'centre', 'licence' as a noun, 'travelling', and 'authorisation', unless quoting the customer or using a fixed name, product term, legal term, or external text.",
        "Prefer South African terms where natural, such as 'cellphone' or 'mobile number', 'petrol', 'rubbish', 'ID number', 'municipality', 'suburb', 'province', 'postal code', 'holiday', and 'queue'.",
        "Use domain-specific South African terms such as 'EFT', 'debit order', 'VAT', 'SARS', 'load shedding', and 'Home Affairs' only when they are directly relevant to the customer's issue.",
        "Format numeric dates as dd/mm/yyyy.",
        "Prefer 24-hour time in formal or operational contexts.",
        "Use light, professional acknowledgements such as 'no problem', 'of course', 'sure', 'thanks for confirming', 'I'll check that for you', and 'let me look into that', without overusing them.",
        "Avoid slang, stereotypes, or heavily colloquial South African phrases such as 'howzit', 'eish', 'sharp', 'lekker', 'ag', 'shame', or 'just now' unless the customer uses them first and the response remains professional.",
        "Avoid American English wording and spelling such as 'gas', 'trash', 'cell phone', 'vacation', 'ZIP code', 'sidewalk', 'checking account', 'color', and 'center' unless quoting the customer or referring to a fixed external term."
      ]
    }
  ];
  var enZA = {
    abuseDetectedTransferMessage: "I'm putting you through to customer support now.",
    abuseDetectedTerminationMessage: "I'm sorry, but I can't help you with that.",
    defaultVoicePersona: "leah-dlamini",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, thanks for calling. How can I help you today?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organization",
    defaultAgentName: "Agent",
    errorMessage: "I've run into a technical problem. I'm sorry for the inconvenience.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Are you still there? I'm here to help.",
    inactivityHangupMessage: "It looks like I haven't heard from you, so I'll end the call for now. Thank you.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-south-african-english"
    ],
    responseGuidanceTraits: SOUTH_AFRICAN_ENGLISH_RESPONSE_TRAITS
  };
  var en_ZA_default = enZA;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-AR/shared.ts
  var esARShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizaci\xF3n",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-AR/index.ts
  var feminine9 = {
    abuseDetectedTransferMessage: "Te estoy transfiriendo ahora a nuestro servicio de atenci\xF3n al cliente.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarte con esa solicitud.",
    ...esARShared,
    defaultVoicePersona: "malena-gomez",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy lista para ayudarte. \xBFEn qu\xE9 puedo ayudarte hoy?",
    errorMessage: "Encontr\xE9 un problema t\xE9cnico. Disculp\xE1 las molestias.",
    inactivityPromptMessage: "\xBFSegu\xEDs ah\xED? Estoy lista para seguir ayud\xE1ndote.",
    inactivityHangupMessage: "Parece que no recib\xED respuesta. Voy a terminar la llamada por ahora. Si volv\xE9s a llamar, voy a estar encantada de ayudarte. Gracias."
  };
  var masculine9 = {
    abuseDetectedTransferMessage: "Te estoy transfiriendo ahora a nuestro servicio de atenci\xF3n al cliente.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarte con esa solicitud.",
    ...esARShared,
    defaultVoicePersona: "carlos-lopez",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy listo para ayudarte. \xBFEn qu\xE9 puedo ayudarte hoy?",
    errorMessage: "Encontr\xE9 un problema t\xE9cnico. Disculp\xE1 las molestias.",
    inactivityPromptMessage: "\xBFSegu\xEDs ah\xED? Estoy listo para seguir ayud\xE1ndote.",
    inactivityHangupMessage: "Parece que no recib\xED respuesta. Voy a terminar la llamada por ahora. Si volv\xE9s a llamar, voy a estar encantado de ayudarte. Gracias."
  };
  var esAR = { feminine: feminine9, masculine: masculine9 };
  var es_AR_default = esAR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-CO/shared.ts
  var esCOShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizaci\xF3n",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-CO/index.ts
  var feminine10 = {
    abuseDetectedTransferMessage: "Te estoy transfiriendo ahora a nuestro servicio de atenci\xF3n al cliente.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarte con esa solicitud.",
    ...esCOShared,
    defaultVoicePersona: "valentina-garcia-mejia",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy lista para ayudarte. \xBFEn qu\xE9 puedo ayudarte hoy?",
    errorMessage: "He encontrado un problema t\xE9cnico. Lamento las molestias.",
    inactivityPromptMessage: "\xBFSigues ah\xED? Estoy lista para seguir ayud\xE1ndote.",
    inactivityHangupMessage: "Parece que no recib\xED respuesta. Voy a terminar la llamada por ahora. Si vuelves a llamar, estar\xE9 encantada de ayudarte. Gracias."
  };
  var masculine10 = {
    abuseDetectedTransferMessage: "Te estoy transfiriendo ahora a nuestro servicio de atenci\xF3n al cliente.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarte con esa solicitud.",
    ...esCOShared,
    defaultVoicePersona: "horacio-gomez-restrepo",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy listo para ayudarte. \xBFEn qu\xE9 puedo ayudarte hoy?",
    errorMessage: "He encontrado un problema t\xE9cnico. Lamento las molestias.",
    inactivityPromptMessage: "\xBFSigues ah\xED? Estoy listo para seguir ayud\xE1ndote.",
    inactivityHangupMessage: "Parece que no recib\xED respuesta. Voy a terminar la llamada por ahora. Si vuelves a llamar, estar\xE9 encantado de ayudarte. Gracias."
  };
  var esCO = { feminine: feminine10, masculine: masculine10 };
  var es_CO_default = esCO;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-ES/shared.ts
  var esESShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizaci\xF3n",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-professional",
      "style-voice-spoken-numerics",
      "language-no-diminutives",
      "tone-warm-concise",
      "behavior-conclusive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adapts Spanish responses to voice, chat, and email."
      },
      {
        id: "style-professional",
        label: "Formal",
        category: "demeanor",
        exclusiveGroup: "style-register",
        description: "Formal Spanish address using usted and third-person verb forms.",
        promptContent: [
          "Use peninsular Spanish and address the customer with usted.",
          "Use forms such as 'perm\xEDtame', 'le ayudo', 'puede', 'su', and 'usted'.",
          "Avoid t\xFA forms such as 'te ayudo', 'puedes', 'tu', and '\xBFquieres?' unless quoting the customer or a fixed term."
        ],
        progressIndicatorPrompt: "Use formal Spanish wait phrases with usted. Prefer calm action phrasing over casual fillers.",
        progressIndicatorExamples: [
          "Perm\xEDtame un momento, por favor.",
          "Lo compruebo ahora.",
          "Estoy revisando la informaci\xF3n."
        ]
      },
      {
        id: "style-colloquial",
        label: "Colloquial",
        category: "demeanor",
        exclusiveGroup: "style-register",
        description: "Approachable Spanish address using t\xFA while staying professional.",
        promptContent: [
          "Use peninsular Spanish and address the customer with t\xFA.",
          "Use natural forms such as 'te ayudo', 'puedes', 'tu', and '\xBFquieres?'.",
          "Stay professional and avoid slang, even when using t\xFA."
        ],
        progressIndicatorPrompt: "Use concise t\xFA-form wait phrases. Keep them professional, never slangy or overly casual.",
        progressIndicatorExamples: [
          "Un momento, lo reviso.",
          "Ahora lo miro.",
          "D\xE9jame comprobarlo."
        ]
      },
      {
        id: "style-voice-spoken-numerics",
        label: "Spanish spoken numerics",
        category: "behavior",
        description: "Reads Spanish dates, times, money, and small numbers naturally on voice.",
        promptContentByChannel: {
          voice: [
            "Say dates, times, money, and small numbers as Spanish words, not digit strings.",
            "Use natural Spanish clock expressions for times: 'nueve y cuarto', 'nueve y media', 'diez menos cuarto', 'mediod\xEDa', and 'medianoche'.",
            "When writing euro amounts, use Spain format with dot thousands, comma decimals, two decimal digits, and \u20AC after the amount, for example '1.234,56 \u20AC' or '100,00 \u20AC'.",
            "Use euro wording like 'doce euros con cuarenta c\xE9ntimos', not 'doce coma cuarenta' or 'EUR doce'.",
            "Use digit-by-digit readback for identifiers such as DNI, NIF, policy numbers, claim numbers, phone numbers, postal codes, and license plates."
          ]
        }
      },
      {
        id: "language-no-diminutives",
        label: "Avoid diminutives",
        category: "behavior",
        description: "Avoids diminutives and tag questions that sound too informal on Spanish voice.",
        promptContent: [
          "Do not use diminutives such as 'segundito', 'momentito', 'rapidito', or 'facilito'.",
          "Use 'un momento, por favor', 'un segundo, por favor', 'r\xE1pido', and 'f\xE1cil' instead.",
          "Do not end instructions with rhetorical tags such as '\xBFvale?', '\xBFverdad?', or '\xBFno?'."
        ]
      },
      {
        id: "tone-warm-concise",
        label: "Warm and concise",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Friendly, close, and brief without sounding robotic or overly emotional.",
        promptContent: [
          "Use a warm, clear, professional tone.",
          "Keep voice replies to one or two short sentences unless the customer asks for more detail.",
          "Do not repeatedly thank the customer. Vary acknowledgments with 'de acuerdo', 'perfecto', 'claro', 'muy bien', 'genial', and 'estupendo'."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        category: "behavior",
        exclusiveGroup: "behavior-posture",
        description: "Moves the conversation forward without unnecessary trailing questions.",
        promptContent: [
          "Answer the customer's request directly and stop once the next useful step is clear.",
          "Ask at most one question per response.",
          "Do not add generic trailing questions after already answering, unless the next step truly requires a choice from the customer."
        ]
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-ES/index.ts
  var feminine11 = {
    abuseDetectedTransferMessage: "Le estoy transfiriendo ahora a nuestro servicio de atenci\xF3n al cliente.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarle con esta solicitud.",
    ...esESShared,
    defaultVoicePersona: "sara-velasco",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy lista para ayudarle. \xBFEn qu\xE9 puedo ayudarle hoy?",
    errorMessage: "He encontrado un problema t\xE9cnico. Lamento las molestias.",
    inactivityPromptMessage: "\xBFSigue ah\xED? Estoy lista para seguir ayud\xE1ndole.",
    inactivityHangupMessage: "Parece que no he recibido respuesta. Voy a finalizar la llamada por ahora. Si vuelve a llamarme, estar\xE9 encantada de ayudarle. Gracias."
  };
  var masculine11 = {
    abuseDetectedTransferMessage: "Le estoy transfiriendo ahora a nuestro servicio de atenci\xF3n al cliente.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarle con esta solicitud.",
    ...esESShared,
    defaultVoicePersona: "david-martin",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy listo para ayudarle. \xBFEn qu\xE9 puedo ayudarle hoy?",
    errorMessage: "He encontrado un problema t\xE9cnico. Lamento las molestias.",
    inactivityPromptMessage: "\xBFSigue ah\xED? Estoy listo para seguir ayud\xE1ndole.",
    inactivityHangupMessage: "Parece que no he recibido respuesta. Voy a finalizar la llamada por ahora. Si vuelve a llamarme, estar\xE9 encantado de ayudarle. Gracias."
  };
  var esES = { feminine: feminine11, masculine: masculine11 };
  var es_ES_default = esES;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-MX/shared.ts
  var esMXShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizaci\xF3n",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-MX/index.ts
  var feminine12 = {
    abuseDetectedTransferMessage: "Te voy a comunicar con nuestro equipo de atenci\xF3n al cliente ahora.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarte con eso.",
    ...esMXShared,
    defaultVoicePersona: "isabel-rios",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy aqu\xED para ayudarte. \xBFEn qu\xE9 puedo asistirte hoy?",
    errorMessage: "He tenido un problema t\xE9cnico. Lamento los inconvenientes.",
    inactivityPromptMessage: "\xBFSigues ah\xED? Estoy lista para ayudarte.",
    inactivityHangupMessage: "Parece que no he recibido respuesta. Voy a terminar la llamada por ahora. Gracias."
  };
  var masculine12 = {
    abuseDetectedTransferMessage: "Te voy a comunicar con nuestro equipo de atenci\xF3n al cliente ahora.",
    abuseDetectedTerminationMessage: "Lo siento, pero no puedo ayudarte con eso.",
    ...esMXShared,
    defaultVoicePersona: "enrique-morales",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hola, gracias por llamar. Estoy aqu\xED para ayudarte. \xBFEn qu\xE9 puedo asistirte hoy?",
    errorMessage: "He tenido un problema t\xE9cnico. Lamento los inconvenientes.",
    inactivityPromptMessage: "\xBFSigues ah\xED? Estoy listo para ayudarte.",
    inactivityHangupMessage: "Parece que no he recibido respuesta. Voy a terminar la llamada por ahora. Gracias."
  };
  var esMX = { feminine: feminine12, masculine: masculine12 };
  var es_MX_default = esMX;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/eu-ES/index.ts
  var euES = {
    abuseDetectedTransferMessage: "Orain bezeroarentzako arretara transferitzen zaituztet.",
    abuseDetectedTerminationMessage: "Barkatu, baina ezin dizuet eskaera horrekin lagundu.",
    defaultVoicePersona: "leire-arriaga",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Kaixo, eskerrik asko deitzeagatik. Nola lagun zaitzaket gaur?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Erakundea",
    defaultAgentName: "Agentea",
    errorMessage: "Arazo tekniko bat izan dut. Barkatu eragozpenak.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Hor al zaude oraindik? Hemen nago laguntzeko.",
    inactivityHangupMessage: "Badirudi ez dudala erantzunik jaso. Deia amaituko dut oraingoz. Eskerrik asko.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var eu_ES_default = euES;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fi-FI/index.ts
  var fiFI = {
    abuseDetectedTransferMessage: "Yhdist\xE4n sinut nyt asiakaspalveluun.",
    abuseDetectedTerminationMessage: "Olen pahoillani, mutta en voi auttaa t\xE4ss\xE4 asiassa.",
    defaultVoicePersona: "aurora-laine",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hei, kiitos soitostasi. Miten voin auttaa sinua t\xE4n\xE4\xE4n?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisaatio",
    defaultAgentName: "Agentti",
    errorMessage: "Minulle tuli tekninen ongelma. Pahoittelen h\xE4iri\xF6t\xE4.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Oletko viel\xE4 linjalla? Olen t\xE4\xE4ll\xE4 auttamassa.",
    inactivityHangupMessage: "En kuullut vastausta, joten lopetan puhelun t\xE4lt\xE4 er\xE4\xE4. Kiitos soitostasi.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-finnish-wording"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      },
      {
        id: "style-finnish-wording",
        label: "Finnish voice wording",
        category: "behavior",
        description: "Finnish phrasing, abbreviations, and readback conventions for voice.",
        promptContent: [
          "Use natural Finnish spelling, vocabulary, and phrasing throughout whenever speaking Finnish.",
          "Prefer long Finnish forms for abbreviations that are ambiguous or TTS-sensitive in voice: write 'kello' rather than 'klo', 'asunto-osakeyhti\xF6' rather than 'As Oy', and 'arvonlis\xE4vero' rather than 'ALV' in formal contexts. Use 'alvi' only when a spoken, business-support register is appropriate.",
          "When dates are meant to be spoken, prefer month-name forms such as '14. toukokuuta 2026' rather than compact numeric dates. Do not guess the meaning of partial date-like strings such as '03.04' or compact ranges; ask for clarification or preserve the source text.",
          "For identifiers, product codes, serial numbers, and email addresses, preserve exact characters when copyability matters. When reading them back aloud, group long sequences deliberately and use Finnish separator words such as 'plus-merkki' for '+', 'miinusmerkki' for '-', 'piste' for '.', and '\xE4t-merkki' for '@'.",
          "Do not rewrite slash-separated text by default. Expand examples such as 'S/N', 'P/N', or 'N/A' to the intended Finnish long form only when the domain makes the meaning clear, such as 'sarjanumero' for a device serial number; otherwise preserve the source text or read the slash as 'kauttaviiva'.",
          "Do not expand compact codes, abbreviations, units, URLs, file paths, legal references, or numeric strings unless the intended meaning is clear from context."
        ]
      }
    ]
  };
  var fi_FI_default = fiFI;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fil-PH/index.ts
  var filPH = {
    abuseDetectedTransferMessage: "Ikokonekta na kita sa customer support ngayon.",
    abuseDetectedTerminationMessage: "Paumanhin, pero hindi kita matutulungan diyan.",
    defaultVoicePersona: "jessa-mendoza",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Kumusta, salamat sa pagtawag. Paano kita matutulungan ngayon?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisasyon",
    defaultAgentName: "Ahente",
    errorMessage: "Nagkaroon ako ng teknikal na problema. Paumanhin sa abala.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Nandiyan ka pa ba? Handa akong magpatuloy sa pagtulong.",
    inactivityHangupMessage: "Mukhang wala akong narinig na tugon, kaya tatapusin ko muna ang tawag. Salamat sa pagtawag.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      },
      {
        id: "taglish-code-switching",
        label: "Taglish code-switching",
        description: "Match the customer's English/Tagalog/Taglish mix per turn, with consistent leveling.",
        category: "behavior",
        promptContextHeading: "Language Matching",
        promptContent: [
          "Respond in the customer's language.",
          "If the customer speaks English only, respond in clear professional English with zero Filipino words.",
          "If the customer uses Tagalog or Taglish, match their language level naturally.",
          "If the customer shifts language mid-conversation, follow the new style immediately.",
          "Do not announce language detection or locale switching.",
          "Before every reply, silently review the customer's last 2-3 messages to pick a Taglish level.",
          "Level 2 - English-first Taglish: response leans English overall, with light Filipino phrases or connectors when natural.",
          "Level 3 - Balanced Taglish: mix English and Filipino naturally. Use Filipino for short acknowledgements and action guidance while keeping product/technical terms in English.",
          "Level 4 - Filipino-dominant Taglish: Filipino carries the sentence structure; keep product, brand, and domain terms in English.",
          "Level 5 - Pure Tagalog: use natural Tagalog, but keep fixed product/brand terms in English when customers would expect them.",
          "Do not mix levels within a single response. Choose the level that best matches the customer and stay consistent for that turn.",
          "Use English for numbers, dates, currencies, phone numbers, and reference codes.",
          "Mirror 'po' and 'opo' when the customer uses them, but never just sprinkle 'po' onto English."
        ]
      }
    ]
  };
  var fil_PH_default = filPH;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-CA/index.ts
  var frCA = {
    abuseDetectedTransferMessage: "Je vous transf\xE8re maintenant \xE0 notre service \xE0 la client\xE8le.",
    abuseDetectedTerminationMessage: "Je suis d\xE9sol\xE9, mais je ne peux pas vous aider avec cette demande.",
    defaultVoicePersona: "manon-moreau",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Bonjour, merci d'avoir appel\xE9. Comment puis-je vous aider aujourd'hui?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisation",
    defaultAgentName: "Agent",
    errorMessage: "J'ai rencontr\xE9 un probl\xE8me technique. Je suis d\xE9sol\xE9 pour ce d\xE9sagr\xE9ment.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\xCAtes-vous toujours l\xE0? Je suis l\xE0 pour vous aider.",
    inactivityHangupMessage: "Je n'ai pas re\xE7u de r\xE9ponse. Je vais mettre fin \xE0 l'appel pour l'instant. Merci.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-quebec-register",
      "style-conversational"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      },
      {
        id: "behavior-curious",
        label: "Curious",
        description: "Asks simple clarifying questions when the customer is unclear.",
        personalityTraitIDs: ["behavior-curious"],
        category: "behavior"
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior"
      },
      {
        id: "behavior-focused",
        label: "Focused",
        description: "Redirects off-topic conversation back to the task at hand.",
        personalityTraitIDs: ["behavior-focused"],
        category: "behavior"
      },
      {
        id: "style-quebec-register",
        label: "Quebec support register",
        category: "behavior",
        description: "Professional Quebec French conventions for customer support, including consistent vouvoiement and local terminology.",
        promptContent: [
          "Use Canadian French suitable for customer support in Qu\xE9bec and broader francophone Canada.",
          "Address the customer with 'vous' unless they clearly use tutoiement and the context supports matching it.",
          "Prefer Canadian French support vocabulary when natural, such as 'service \xE0 la client\xE8le', 'courriel', 'code postal', 'cellulaire', and 'num\xE9ro de confirmation'.",
          "Avoid France-specific idioms, slang, or wording that may sound unnatural in Canadian French.",
          "Use natural, idiomatic Canadian French rather than word-for-word translations from English. Preserve the customer-support intent and tone, but choose phrasing that sounds native to Qu\xE9bec and broader francophone Canada. This is especially important for common service phrases such as greetings, acknowledgments, apologies, thanks, confirmations, and closings. For example, when politely acknowledging a customer\u2019s thanks, prefer \u201CJe vous en prie\u201D or \u201C\xC7a me fait plaisir,\u201D depending on the desired tone. Avoid literal translations that carry a different meaning, such as \u201Cvous \xEAtes les bienvenus.\u201D",
          "Keep phrasing clear, polite, and neutral for Qu\xE9bec and broader Canadian French audiences."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register",
        progressIndicatorPrompt: "Use clear, natural spoken Canadian French for a live support call. Keep phrasing short, simple, and action-oriented, and understandable across Qu\xE9bec and broader francophone Canada.",
        progressIndicatorExamples: [
          "D'accord, je v\xE9rifie \xE7a.",
          "Parfait, je regarde \xE7a pour vous.",
          "Un instant, je confirme les d\xE9tails."
        ]
      },
      {
        id: "style-colloquial",
        label: "Colloquial",
        description: "Relaxed Quebec French phrasing for voice and chat while staying professional and easy to understand.",
        category: "demeanor",
        exclusiveGroup: "style-register",
        personalityTraitIDs: ["style-colloquial"],
        promptContentByChannel: {
          voice: [
            "Use natural spoken Canadian French, with a Qu\xE9bec customer-support feel, while staying respectful and clear.",
            "Write like a live support agent speaking aloud, not like a formal written message. Prefer short, conversational clauses.",
            "Stay in vouvoiement by default. Only mirror tutoiement if the customer clearly uses it and the context is informal.",
            "Use light conversational markers when helpful, such as 'D'accord', 'Parfait', 'Je regarde \xE7a', 'Un instant', 'Je vous explique', or '\xC7a marche'.",
            "It is okay to start with a brief grounding phrase before the full answer, such as 'Oui, je vois', 'Alors', or 'D'accord, je regarde \xE7a'.",
            "Use mild, natural hesitations sparingly, such as 'euh', 'bon', or 'alors', only when they make the response sound more human. Do not overuse fillers.",
            "Use punctuation to control pacing when it improves natural delivery, such as occasional ellipses (...) or dashes (\u2014) to reflect brief pauses or self-correction. Use these sparingly and avoid overuse.",
            "Avoid long, complex sentences. Break thoughts into smaller spoken chunks to reflect real-time thinking.",
            "Avoid heavy slang, jokes, swear words, overly regional expressions, or wording that could sound unprofessional or hard to understand outside Qu\xE9bec.",
            "Allow slight self-corrections or mid-sentence adjustments when natural (e.g., 'Je vais v\xE9rifier\u2014en fait, je vois d\xE9j\xE0 l\u2019information ici')."
          ],
          text: [
            "Use concise, natural Quebec French phrasing suitable for customer support chat.",
            "Keep tone clear and respectful, and avoid overly casual slang."
          ]
        },
        progressIndicatorPrompt: "Use natural, spoken Qu\xE9bec-style French for a live support call. Keep phrasing short, clear, and action-oriented, while remaining respectful and understandable across francophone Canada.",
        progressIndicatorExamples: [
          "Parfait... je v\xE9rifie \xE7a tout de suite.",
          "D'accord, un petit instant\u2014je regarde \xE7a.",
          "Oui, je vois... je regarde \xE7a pour vous."
        ]
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        description: "All essential details included, broken into clear steps or sentences.",
        personalityTraitIDs: ["style-thorough"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-measured",
        label: "Measured",
        description: "Steady, deliberate pacing using commas, em dashes, and occasional ellipses.",
        personalityTraitIDs: ["delivery-measured"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "tone-warm",
        label: "Warm",
        description: "Friendly, inclusive language with collaborative phrasing. Avoids cold or transactional wording.",
        personalityTraitIDs: ["tone-warm"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-confident",
        label: "Confident",
        description: "Clear, declarative sentences and active voice. States information directly without hedging.",
        personalityTraitIDs: ["tone-confident"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      }
    ]
  };
  var fr_CA_default = frCA;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-CH/index.ts
  var frCH = {
    abuseDetectedTransferMessage: "Je vous transf\xE8re maintenant vers notre service client.",
    abuseDetectedTerminationMessage: "Je suis d\xE9sol\xE9, mais je ne peux pas vous aider avec cela.",
    defaultVoicePersona: "ariane-favre",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Bonjour, merci de votre appel. Comment puis-je vous aider aujourd'hui\xA0?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisation",
    defaultAgentName: "Agent",
    errorMessage: "J'ai rencontr\xE9 un probl\xE8me technique. Je suis d\xE9sol\xE9 pour la g\xEAne occasionn\xE9e.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\xCAtes-vous toujours en ligne\xA0? Je suis l\xE0 pour vous aider.",
    inactivityHangupMessage: "Je n'ai pas re\xE7u de r\xE9ponse. Je vais mettre fin \xE0 l'appel pour le moment. Merci.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var fr_CH_default = frCH;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-FR/shared.ts
  var frFRShared = {
    defaultOrganizationName: "Votre organisation",
    defaultAgentName: "Service client",
    uninterruptibleGreeting: false,
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-french-wording",
      "style-professional"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "style-french-wording",
        label: "French vocabulary",
        category: "base",
        description: "Metropolitan French vocabulary and phrasing conventions for customer service.",
        promptContent: [
          "Use natural Metropolitan French spelling, vocabulary, and phrasing throughout whenever speaking French.",
          "Use idiomatic French phrasing instead of verbatim English translation.",
          "Use Metropolitan French customer-service vocabulary: 'service client', 'num\xE9ro de t\xE9l\xE9phone', 'code postal', and 'e-mail'.",
          "Format numeric dates as dd/mm/yyyy (e.g. '24/06/2021').",
          "Format French phone numbers as five 2-digit pairs (e.g. '01 23 45 67 89' or '+33 1 23 45 67 89').",
          "Format euro amounts in the French convention with spaces as thousands separators, a comma decimal, and a non-breaking space before the symbol: '1 234,56 \u20AC'.",
          "Use natural French elliptical replies where appropriate: 'Effectivement', 'Tout \xE0 fait', 'Pas de souci', 'Malheureusement', 'Bien s\xFBr'.",
          "Avoid English filler or anglicised wording unless quoting a customer name or a fixed external term."
        ],
        promptContentByChannel: {
          voice: 'When giving or reading back a French postal code in voice, wrap the five digits in a <PostCode> tag so synthesis can identify and pronounce it correctly. Use this both for standalone postal codes and full addresses, for example "<PostCode>75003</PostCode>" and "68 rue des Archives, <PostCode>75003</PostCode> Paris".'
        }
      },
      {
        id: "style-professional",
        label: "Vouvoiement (formal)",
        category: "demeanor",
        exclusiveGroup: "style-register",
        description: "Formal French address using 'vous' and polite forms suited to most customer-service contexts.",
        promptContent: [
          "Address the customer with 'vous' (vouvoiement) at all times. Use possessive 'votre' / 'vos' and the corresponding verb conjugations ('pouvez-vous', 'souhaitez-vous', 'avez-vous').",
          "Use polite question forms: 'Pouvez-vous me dire\u2026?', 'Pourriez-vous me confirmer\u2026?', 'Auriez-vous\u2026?'.",
          "Do not switch to 'tu' even if the customer uses it; mirror their tone but keep vouvoiement in your own turns."
        ],
        progressIndicatorPrompt: "Use formal vouvoiement wait phrases. Keep them brief and polite, never casual.",
        progressIndicatorExamples: [
          "Un instant s\u2019il vous pla\xEEt.",
          "Je regarde \xE7a tout de suite.",
          "Donnez-moi une seconde."
        ]
      },
      {
        id: "style-colloquial",
        label: "Tutoiement (informal)",
        category: "demeanor",
        exclusiveGroup: "style-register",
        description: "Informal French address using 'tu' for brands whose voice is intentionally casual.",
        promptContent: [
          "Address the customer with 'tu' (tutoiement). Use possessive 'ton' / 'ta' / 'tes' and the corresponding verb conjugations ('peux-tu', 'veux-tu', 'as-tu').",
          "Stay professional and avoid slang even when using tu \u2014 tutoiement signals warmth, not casualness.",
          "Do not switch to 'vous' even if the customer uses it; mirror their tone but keep tutoiement in your own turns."
        ],
        progressIndicatorPrompt: "Use concise tutoiement wait phrases. Stay professional and avoid slang even when using tu.",
        progressIndicatorExamples: [
          "Un instant s\u2019il te pla\xEEt.",
          "Je regarde \xE7a tout de suite.",
          "Donne-moi une seconde."
        ]
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-FR/index.ts
  var feminine13 = {
    ...frFRShared,
    defaultVoicePersona: "vivienne-marche",
    defaultVoiceGreeting: "Bonjour, merci d'avoir appel\xE9. Comment puis-je vous aider aujourd'hui\xA0?",
    errorMessage: "J'ai rencontr\xE9 un probl\xE8me technique. Je suis d\xE9sol\xE9e pour ce d\xE9sagr\xE9ment.",
    abuseDetectedTransferMessage: "Je vous transf\xE8re maintenant vers notre service client.",
    abuseDetectedTerminationMessage: "Je suis d\xE9sol\xE9e, mais je ne peux pas r\xE9pondre \xE0 cette demande.",
    inactivityPromptMessage: "\xCAtes-vous toujours en ligne\xA0? Je suis l\xE0 pour vous aider.",
    inactivityHangupMessage: "Je n'ai pas re\xE7u de r\xE9ponse. Je vais mettre fin \xE0 l'appel. N'h\xE9sitez pas \xE0 nous rappeler. Merci.",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: []
  };
  var masculine13 = {
    ...frFRShared,
    defaultVoicePersona: "romeo-bassi-v2",
    defaultVoiceGreeting: "Bonjour, merci d'avoir appel\xE9. Comment puis-je vous aider aujourd'hui\xA0?",
    errorMessage: "J'ai rencontr\xE9 un probl\xE8me technique. Je suis d\xE9sol\xE9 pour ce d\xE9sagr\xE9ment.",
    abuseDetectedTransferMessage: "Je vous transf\xE8re maintenant vers notre service client.",
    abuseDetectedTerminationMessage: "Je suis d\xE9sol\xE9, mais je ne peux pas r\xE9pondre \xE0 cette demande.",
    inactivityPromptMessage: "\xCAtes-vous toujours en ligne\xA0? Je suis l\xE0 pour vous aider.",
    inactivityHangupMessage: "Je n'ai pas re\xE7u de r\xE9ponse. Je vais mettre fin \xE0 l'appel. N'h\xE9sitez pas \xE0 nous rappeler. Merci.",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: []
  };
  var frFR = { feminine: feminine13, masculine: masculine13 };
  var fr_FR_default = frFR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-SN/index.ts
  var frSN = {
    // Bootstrap fr-SN from fr-FR until Senegal-specific XOF/+221 guidance is defined.
    ...frFRShared,
    abuseDetectedTransferMessage: "Je vous transf\xE8re maintenant vers notre service client.",
    abuseDetectedTerminationMessage: "Je suis d\xE9sol\xE9, mais je ne peux pas r\xE9pondre \xE0 cette demande.",
    defaultVoicePersona: "jacques-diop",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Bonjour, merci d'avoir appel\xE9. Comment puis-je vous aider aujourd'hui\xA0?",
    errorMessage: "J'ai rencontr\xE9 un probl\xE8me technique. Je suis d\xE9sol\xE9 pour ce d\xE9sagr\xE9ment.",
    inactivityPromptMessage: "\xCAtes-vous toujours en ligne\xA0? Je suis l\xE0 pour vous aider.",
    inactivityHangupMessage: "Je n'ai pas re\xE7u de r\xE9ponse. Je vais mettre fin \xE0 l'appel. N'h\xE9sitez pas \xE0 nous rappeler. Merci."
  };
  var fr_SN_default = frSN;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/gl-ES/shared.ts
  var glESShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizaci\xF3n",
    defaultAgentName: "Axente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/gl-ES/index.ts
  var feminine14 = {
    abuseDetectedTransferMessage: "Agora vou transferir a chamada ao noso servizo de atenci\xF3n ao cliente.",
    abuseDetectedTerminationMessage: "S\xEDntoo, pero non podo axudarlle con esa solicitude.",
    ...glESShared,
    defaultVoicePersona: "sabela-varela",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Ola, grazas por chamar. Estou preparada para axudar. En que podo axudar hoxe?",
    errorMessage: "Atopei un problema t\xE9cnico. Sent\xEDmolo polas molestias.",
    inactivityPromptMessage: "Segue a\xED? Estou preparada para seguir axudando.",
    inactivityHangupMessage: "Parece que non recib\xEDn resposta. Vou rematar a chamada por agora. Se volve chamar, estarei encantada de axudar. Grazas."
  };
  var masculine14 = {
    abuseDetectedTransferMessage: "Agora vou transferir a chamada ao noso servizo de atenci\xF3n ao cliente.",
    abuseDetectedTerminationMessage: "S\xEDntoo, pero non podo axudarlle con esa solicitude.",
    ...glESShared,
    defaultVoicePersona: "roi-maceiras",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Ola, grazas por chamar. Estou preparado para axudar. En que podo axudar hoxe?",
    errorMessage: "Atopei un problema t\xE9cnico. Sent\xEDmolo polas molestias.",
    inactivityPromptMessage: "Segue a\xED? Estou preparado para seguir axudando.",
    inactivityHangupMessage: "Parece que non recib\xEDn resposta. Vou rematar a chamada por agora. Se volve chamar, estarei encantado de axudar. Grazas."
  };
  var glES = { feminine: feminine14, masculine: masculine14 };
  var gl_ES_default = glES;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/he-IL/shared.ts
  var heILShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u05D0\u05E8\u05D2\u05D5\u05DF",
    defaultAgentName: "\u05E1\u05D5\u05DB\u05DF",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/he-IL/index.ts
  var feminine15 = {
    abuseDetectedTransferMessage: "\u05D0\u05D7\u05D1\u05E8 \u05D0\u05EA\u05DB\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5 \u05DC\u05E9\u05D9\u05E8\u05D5\u05EA \u05D4\u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5.",
    abuseDetectedTerminationMessage: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05E1\u05D9\u05D9\u05E2 \u05D1\u05D1\u05E7\u05E9\u05D4 \u05D4\u05D6\u05D5.",
    ...heILShared,
    defaultVoicePersona: "noa-levi",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u05E9\u05DC\u05D5\u05DD, \u05EA\u05D5\u05D3\u05D4 \u05E9\u05D4\u05EA\u05E7\u05E9\u05E8\u05EA. \u05D0\u05E0\u05D9 \u05DE\u05D5\u05DB\u05E0\u05D4 \u05DC\u05E2\u05D6\u05D5\u05E8. \u05D0\u05D9\u05DA \u05D0\u05D5\u05DB\u05DC \u05DC\u05E2\u05D6\u05D5\u05E8 \u05D4\u05D9\u05D5\u05DD?",
    errorMessage: "\u05D4\u05EA\u05E8\u05D7\u05E9\u05D4 \u05D1\u05E2\u05D9\u05D4 \u05D8\u05DB\u05E0\u05D9\u05EA. \u05E1\u05DC\u05D9\u05D7\u05D4 \u05E2\u05DC \u05D0\u05D9 \u05D4\u05E0\u05D5\u05D7\u05D5\u05EA.",
    inactivityPromptMessage: "\u05D4\u05D0\u05DD \u05E2\u05D3\u05D9\u05D9\u05DF \u05E2\u05DC \u05D4\u05E7\u05D5? \u05D0\u05E0\u05D9 \u05DE\u05D5\u05DB\u05E0\u05D4 \u05DC\u05D4\u05DE\u05E9\u05D9\u05DA \u05D5\u05DC\u05E2\u05D6\u05D5\u05E8.",
    inactivityHangupMessage: "\u05E0\u05E8\u05D0\u05D4 \u05E9\u05DC\u05D0 \u05E7\u05D9\u05D1\u05DC\u05EA\u05D9 \u05EA\u05E9\u05D5\u05D1\u05D4. \u05D0\u05E1\u05D9\u05D9\u05DD \u05D0\u05EA \u05D4\u05E9\u05D9\u05D7\u05D4 \u05DC\u05E2\u05EA \u05E2\u05EA\u05D4. \u05D0\u05DD \u05EA\u05EA\u05E7\u05E9\u05E8\u05D5 \u05E9\u05D5\u05D1, \u05D0\u05D4\u05D9\u05D4 \u05E9\u05DE\u05D7\u05D4 \u05DC\u05E2\u05D6\u05D5\u05E8. \u05EA\u05D5\u05D3\u05D4."
  };
  var masculine15 = {
    abuseDetectedTransferMessage: "\u05D0\u05D7\u05D1\u05E8 \u05D0\u05EA\u05DB\u05DD \u05E2\u05DB\u05E9\u05D9\u05D5 \u05DC\u05E9\u05D9\u05E8\u05D5\u05EA \u05D4\u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5.",
    abuseDetectedTerminationMessage: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05E1\u05D9\u05D9\u05E2 \u05D1\u05D1\u05E7\u05E9\u05D4 \u05D4\u05D6\u05D5.",
    ...heILShared,
    defaultVoicePersona: "eitan-cohen",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u05E9\u05DC\u05D5\u05DD, \u05EA\u05D5\u05D3\u05D4 \u05E9\u05D4\u05EA\u05E7\u05E9\u05E8\u05EA. \u05D0\u05E0\u05D9 \u05DE\u05D5\u05DB\u05DF \u05DC\u05E2\u05D6\u05D5\u05E8. \u05D0\u05D9\u05DA \u05D0\u05D5\u05DB\u05DC \u05DC\u05E2\u05D6\u05D5\u05E8 \u05D4\u05D9\u05D5\u05DD?",
    errorMessage: "\u05D4\u05EA\u05E8\u05D7\u05E9\u05D4 \u05D1\u05E2\u05D9\u05D4 \u05D8\u05DB\u05E0\u05D9\u05EA. \u05E1\u05DC\u05D9\u05D7\u05D4 \u05E2\u05DC \u05D0\u05D9 \u05D4\u05E0\u05D5\u05D7\u05D5\u05EA.",
    inactivityPromptMessage: "\u05D4\u05D0\u05DD \u05E2\u05D3\u05D9\u05D9\u05DF \u05E2\u05DC \u05D4\u05E7\u05D5? \u05D0\u05E0\u05D9 \u05DE\u05D5\u05DB\u05DF \u05DC\u05D4\u05DE\u05E9\u05D9\u05DA \u05D5\u05DC\u05E2\u05D6\u05D5\u05E8.",
    inactivityHangupMessage: "\u05E0\u05E8\u05D0\u05D4 \u05E9\u05DC\u05D0 \u05E7\u05D9\u05D1\u05DC\u05EA\u05D9 \u05EA\u05E9\u05D5\u05D1\u05D4. \u05D0\u05E1\u05D9\u05D9\u05DD \u05D0\u05EA \u05D4\u05E9\u05D9\u05D7\u05D4 \u05DC\u05E2\u05EA \u05E2\u05EA\u05D4. \u05D0\u05DD \u05EA\u05EA\u05E7\u05E9\u05E8\u05D5 \u05E9\u05D5\u05D1, \u05D0\u05D4\u05D9\u05D4 \u05E9\u05DE\u05D7 \u05DC\u05E2\u05D6\u05D5\u05E8. \u05EA\u05D5\u05D3\u05D4."
  };
  var heIL = { feminine: feminine15, masculine: masculine15 };
  var he_IL_default = heIL;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/hi-IN/shared.ts
  var hiINShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0938\u0902\u0917\u0920\u0928",
    defaultAgentName: "\u090F\u091C\u0947\u0902\u091F",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/hi-IN/index.ts
  var feminine16 = {
    abuseDetectedTransferMessage: "\u092E\u0948\u0902 \u0905\u092D\u0940 \u0906\u092A\u0915\u094B \u0939\u092E\u093E\u0930\u0940 \u0917\u094D\u0930\u093E\u0939\u0915 \u0938\u0947\u0935\u093E \u091F\u0940\u092E \u0938\u0947 \u091C\u094B\u0921\u093C \u0930\u0939\u0940 \u0939\u0942\u0901\u0964",
    abuseDetectedTerminationMessage: "\u092E\u0941\u091D\u0947 \u0916\u0947\u0926 \u0939\u0948, \u0932\u0947\u0915\u093F\u0928 \u092E\u0948\u0902 \u0907\u0938\u092E\u0947\u0902 \u0906\u092A\u0915\u0940 \u092E\u0926\u0926 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u0940\u0964",
    ...hiINShared,
    defaultVoicePersona: "riya-rao",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0928\u092E\u0938\u094D\u0924\u0947, \u0915\u0949\u0932 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0915\u0948\u0938\u0947 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u0940 \u0939\u0942\u0901?",
    errorMessage: "\u092E\u0941\u091D\u0947 \u090F\u0915 \u0924\u0915\u0928\u0940\u0915\u0940 \u0938\u092E\u0938\u094D\u092F\u093E \u0906 \u0917\u0908 \u0939\u0948\u0964 \u0905\u0938\u0941\u0935\u093F\u0927\u093E \u0915\u0947 \u0932\u093F\u090F \u0916\u0947\u0926 \u0939\u0948\u0964",
    inactivityPromptMessage: "\u0915\u094D\u092F\u093E \u0906\u092A \u0905\u092D\u0940 \u092D\u0940 \u0932\u093E\u0907\u0928 \u092A\u0930 \u0939\u0948\u0902? \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u0940 \u0939\u0942\u0901\u0964",
    inactivityHangupMessage: "\u0932\u0917\u0924\u093E \u0939\u0948 \u0905\u092D\u0940 \u0915\u094B\u0908 \u091C\u0935\u093E\u092C \u0928\u0939\u0940\u0902 \u092E\u093F\u0932 \u0930\u0939\u093E\u0964 \u092E\u0948\u0902 \u092F\u0939 \u0915\u0949\u0932 \u0905\u092D\u0940 \u0938\u092E\u093E\u092A\u094D\u0924 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0942\u0901\u0964 \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964"
  };
  var masculine16 = {
    abuseDetectedTransferMessage: "\u092E\u0948\u0902 \u0905\u092D\u0940 \u0906\u092A\u0915\u094B \u0939\u092E\u093E\u0930\u0940 \u0917\u094D\u0930\u093E\u0939\u0915 \u0938\u0947\u0935\u093E \u091F\u0940\u092E \u0938\u0947 \u091C\u094B\u0921\u093C \u0930\u0939\u093E \u0939\u0942\u0901\u0964",
    abuseDetectedTerminationMessage: "\u092E\u0941\u091D\u0947 \u0916\u0947\u0926 \u0939\u0948, \u0932\u0947\u0915\u093F\u0928 \u092E\u0948\u0902 \u0907\u0938\u092E\u0947\u0902 \u0906\u092A\u0915\u0940 \u092E\u0926\u0926 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u093E\u0964",
    ...hiINShared,
    defaultVoicePersona: "leo-sharma",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0928\u092E\u0938\u094D\u0924\u0947, \u0915\u0949\u0932 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0915\u0948\u0938\u0947 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0901?",
    errorMessage: "\u092E\u0941\u091D\u0947 \u090F\u0915 \u0924\u0915\u0928\u0940\u0915\u0940 \u0938\u092E\u0938\u094D\u092F\u093E \u0906 \u0917\u0908 \u0939\u0948\u0964 \u0905\u0938\u0941\u0935\u093F\u0927\u093E \u0915\u0947 \u0932\u093F\u090F \u0916\u0947\u0926 \u0939\u0948\u0964",
    inactivityPromptMessage: "\u0915\u094D\u092F\u093E \u0906\u092A \u0905\u092D\u0940 \u092D\u0940 \u0932\u093E\u0907\u0928 \u092A\u0930 \u0939\u0948\u0902? \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0901\u0964",
    inactivityHangupMessage: "\u0932\u0917\u0924\u093E \u0939\u0948 \u0905\u092D\u0940 \u0915\u094B\u0908 \u091C\u0935\u093E\u092C \u0928\u0939\u0940\u0902 \u092E\u093F\u0932 \u0930\u0939\u093E\u0964 \u092E\u0948\u0902 \u092F\u0939 \u0915\u0949\u0932 \u0905\u092D\u0940 \u0938\u092E\u093E\u092A\u094D\u0924 \u0915\u0930 \u0930\u0939\u093E \u0939\u0942\u0901\u0964 \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964"
  };
  var hiIN = { feminine: feminine16, masculine: masculine16 };
  var hi_IN_default = hiIN;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/hr-HR/index.ts
  var hrHR = {
    abuseDetectedTransferMessage: "Sada vas prebacujem na korisni\u010Dku podr\u0161ku.",
    abuseDetectedTerminationMessage: "\u017Dao mi je, ali s tim vam ne mogu pomo\u0107i.",
    defaultVoicePersona: "zuzana-novakova",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dobar dan, hvala na pozivu. Kako vam danas mogu pomo\u0107i?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizacija",
    defaultAgentName: "Agent",
    errorMessage: "Do\u0161lo je do tehni\u010Dkog problema. Ispri\u010Davam se zbog neugodnosti.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Jeste li jo\u0161 tu? Tu sam ako vam je i dalje potrebna pomo\u0107.",
    inactivityHangupMessage: "\u010Cini se da nema odgovora pa \u0107u sada prekinuti poziv. Hvala na pozivu.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: []
  };
  var hr_HR_default = hrHR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/hu-HU/index.ts
  var huHU = {
    abuseDetectedTransferMessage: "Most kapcsolom az \xFCgyf\xE9lszolg\xE1lathoz.",
    abuseDetectedTerminationMessage: "Sajn\xE1lom, de ebben nem tudok seg\xEDteni.",
    defaultVoicePersona: "vera-nagy",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\xDCdv\xF6zl\xF6m, k\xF6sz\xF6n\xF6m a h\xEDv\xE1s\xE1t. Miben seg\xEDthetek ma?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Szervezet",
    defaultAgentName: "\xDCgyn\xF6k",
    errorMessage: "Technikai probl\xE9m\xE1ba \xFCtk\xF6ztem. Eln\xE9z\xE9st a kellemetlens\xE9g\xE9rt.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "M\xE9g vonalban van? Itt vagyok, ha tov\xE1bbra is seg\xEDts\xE9gre van sz\xFCks\xE9ge.",
    inactivityHangupMessage: "\xDAgy t\u0171nik, nem kaptam v\xE1laszt, ez\xE9rt most befejezem a h\xEDv\xE1st. K\xF6sz\xF6n\xF6m.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var hu_HU_default = huHU;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/id-ID/index.ts
  var idID = {
    defaultVoicePersona: "nisrina-salsabila",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    abuseDetectedTransferMessage: "Saya akan menghubungkan Anda dengan tim dukungan pelanggan kami.",
    abuseDetectedTerminationMessage: "Maaf, saya tidak bisa membantu untuk hal itu.",
    defaultVoiceGreeting: "Halo, terima kasih untuk telepon Anda. Apa yang bisa saya bantu hari ini?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisasi",
    defaultAgentName: "Agen",
    errorMessage: "Mohon maaf, saya sedang mengalami masalah teknis.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Apakah Anda masih di sana?",
    inactivityHangupMessage: "Sepertinya saya belum menerima jawaban dari Anda, saya akan mengakhiri panggilan Anda untuk saat ini. Terima kasih.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-professional"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      },
      {
        id: "style-professional",
        label: "Formal",
        category: "demeanor",
        exclusiveGroup: "style-register",
        description: "Formal Indonesian address using Anda, suitable for traditional customer service.",
        promptContent: [
          "Use formal Indonesian (Bahasa baku) and address the customer with 'Anda'.",
          "Use 'saya' for first person. Never use 'aku', 'gue', or 'gw'.",
          "Avoid casual second-person pronouns such as 'kamu', 'lo', or 'lu'.",
          "Avoid casual particles such as 'sih', 'deh', 'kok', 'nih', 'tuh', and 'loh'.",
          "Use formal request forms such as 'Mohon...', 'Silakan...', and 'Apakah Anda berkenan...'.",
          "Use full word forms such as 'terima kasih', 'tidak', and 'sudah' rather than 'makasih', 'gak'/'nggak', or 'udah'.",
          "Keep verb forms with proper prefixes (e.g. 'membantu', 'menghubungkan') rather than dropping them."
        ],
        progressIndicatorPrompt: "Use formal Indonesian wait phrases with Anda. Prefer calm, professional phrasing.",
        progressIndicatorExamples: [
          "Mohon ditunggu sebentar.",
          "Saya periksa terlebih dahulu.",
          "Mohon ditunggu, saya akan memeriksa informasi tersebut."
        ]
      },
      {
        id: "style-colloquial",
        label: "Conversational",
        category: "demeanor",
        exclusiveGroup: "style-register",
        description: "Approachable Indonesian address using kamu while staying professional, suited to modern consumer brands.",
        promptContent: [
          "Use conversational Indonesian and address the customer with 'Anda'.",
          "Use 'saya' for first person. Never use 'aku', 'gue', or 'gw' in customer service.",
          "Keep the tone friendly and natural, but stay professional and do not use slang such as 'lo', 'gue', 'dong', 'sih' or 'banget'.",
          "Light, natural particles such as 'ya' or 'kok' are acceptable when they fit the flow, but do not pile them on.",
          "Use everyday forms such as 'makasih' or 'terima kasih', 'nggak' or 'tidak' \u2014 match what the customer uses.",
          "Avoid overly formal phrasing such as 'Mohon' unless the customer signals they prefer it."
        ],
        progressIndicatorPrompt: "Use short, friendly Indonesian wait phrases. Keep them professional, never slangy.",
        progressIndicatorExamples: [
          "Sebentar ya, saya cek dulu.",
          "Saya lihat dulu ya.",
          "Tunggu sebentar, ya."
        ]
      }
    ]
  };
  var id_ID_default = idID;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/is-IS/index.ts
  var isIS = {
    abuseDetectedTransferMessage: "\xC9g er a\xF0 tengja \xFEig vi\xF0 \xFEj\xF3nustuveri\xF0 n\xFAna.",
    abuseDetectedTerminationMessage: "\xDEv\xED mi\xF0ur get \xE9g ekki a\xF0sto\xF0a\xF0 vi\xF0 \xFEetta.",
    defaultVoicePersona: "emma-solberg",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hall\xF3, takk fyrir a\xF0 hringja. Hvernig get \xE9g a\xF0sto\xF0a\xF0 \xFEig \xED dag?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Fyrirt\xE6ki",
    defaultAgentName: "Fulltr\xFAi",
    errorMessage: "\xDEa\xF0 kom upp t\xE6knilegt vandam\xE1l. Afsaka\xF0u \xF3\xFE\xE6gindin.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Ertu enn \xFEarna? \xC9g er h\xE9r ef \xFE\xFA \xFEarft enn a\xF0sto\xF0.",
    inactivityHangupMessage: "\xDEa\xF0 vir\xF0ist sem ekkert svar hafi borist, svo \xE9g l\xFDk s\xEDmtalinu n\xFAna. Takk fyrir a\xF0 hringja.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: []
  };
  var is_IS_default = isIS;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/it-IT/shared.ts
  var itITShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizzazione",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/it-IT/index.ts
  var feminine17 = {
    abuseDetectedTransferMessage: "La sto trasferendo ora al nostro servizio clienti.",
    abuseDetectedTerminationMessage: "Mi dispiace, ma non posso aiutarLa con questa richiesta.",
    ...itITShared,
    defaultVoicePersona: "violetta-rossi",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Buongiorno, grazie per aver chiamato. Sono pronta ad aiutarLa. In che modo posso esserLe utile oggi?",
    errorMessage: "Si \xE8 verificato un problema tecnico. Mi scuso per l'inconveniente.",
    inactivityPromptMessage: "\xC8 ancora in linea? Sono pronta a continuare ad aiutarLa.",
    inactivityHangupMessage: "Sembra che non ci sia risposta. Chiuder\xF2 la chiamata per il momento. Se desidera richiamare, sar\xF2 lieta di aiutarLa. Grazie."
  };
  var masculine17 = {
    abuseDetectedTransferMessage: "La sto trasferendo ora al nostro servizio clienti.",
    abuseDetectedTerminationMessage: "Mi dispiace, ma non posso aiutarLa con questa richiesta.",
    ...itITShared,
    defaultVoicePersona: "gioele-mediterraneo",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Buongiorno, grazie per aver chiamato. Sono pronto ad aiutarLa. In che modo posso esserLe utile oggi?",
    errorMessage: "Si \xE8 verificato un problema tecnico. Mi scuso per l'inconveniente.",
    inactivityPromptMessage: "\xC8 ancora in linea? Sono pronto a continuare ad aiutarLa.",
    inactivityHangupMessage: "Sembra che non ci sia risposta. Chiuder\xF2 la chiamata per il momento. Se desidera richiamare, sar\xF2 lieto di aiutarLa. Grazie."
  };
  var itIT = { feminine: feminine17, masculine: masculine17 };
  var it_IT_default = itIT;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ja-JP/index.ts
  var jaJP = {
    abuseDetectedTransferMessage: "\u62C5\u5F53\u8005\u306B\u304A\u3064\u306A\u304E\u3044\u305F\u3057\u307E\u3059\u3002",
    abuseDetectedTerminationMessage: "\u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\u3001\u305D\u306E\u4EF6\u306B\u3064\u3044\u3066\u306F\u304A\u624B\u4F1D\u3044\u3067\u304D\u307E\u305B\u3093\u3002",
    defaultVoicePersona: "emiko-tanaka",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u304A\u96FB\u8A71\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u672C\u65E5\u306F\u3069\u306E\u3088\u3046\u306A\u3054\u7528\u4EF6\u3067\u3057\u3087\u3046\u304B\u3002",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u7D44\u7E54",
    defaultAgentName: "\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8",
    errorMessage: "\u6280\u8853\u7684\u306A\u30C8\u30E9\u30D6\u30EB\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3054\u4E0D\u4FBF\u3092\u304A\u304B\u3051\u3057\u3066\u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\u3002",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\u304A\u5BA2\u69D8\u306E\u304A\u58F0\u304C\u805E\u304D\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u6050\u308C\u5165\u308A\u307E\u3059\u304C\u3001\u3082\u3046\u4E00\u5EA6\u304A\u9858\u3044\u3067\u304D\u307E\u3059\u3067\u3057\u3087\u3046\u304B\u3002",
    inactivityHangupMessage: "\u4E00\u5B9A\u6642\u9593\u304A\u5BA2\u69D8\u306E\u304A\u58F0\u304C\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u306E\u3067\u3001\u672C\u65E5\u306F\u304A\u96FB\u8A71\u3092\u7D42\u4E86\u3055\u305B\u3066\u3044\u305F\u3060\u304D\u307E\u3059\u3002\u307E\u305F\u306E\u3054\u9023\u7D61\u3092\u304A\u5F85\u3061\u3057\u3066\u304A\u308A\u307E\u3059\u3002",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var ja_JP_default = jaJP;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ko-KR/index.ts
  var koKR = {
    abuseDetectedTransferMessage: "\uC9C0\uAE08 \uACE0\uAC1D \uC9C0\uC6D0\uD300\uC73C\uB85C \uC5F0\uACB0\uD574 \uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4.",
    abuseDetectedTerminationMessage: "\uC8C4\uC1A1\uD558\uC9C0\uB9CC \uADF8 \uC694\uCCAD\uC740 \uB3C4\uC640\uB4DC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    defaultVoicePersona: "salang-choi",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\uC548\uB155\uD558\uC138\uC694, \uC804\uD654 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4. \uC624\uB298 \uBB34\uC5C7\uC744 \uB3C4\uC640\uB4DC\uB9B4\uAE4C\uC694?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\uC870\uC9C1",
    defaultAgentName: "\uC5D0\uC774\uC804\uD2B8",
    errorMessage: "\uAE30\uC220\uC801\uC778 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uBD88\uD3B8\uC744 \uB4DC\uB824 \uC8C4\uC1A1\uD569\uB2C8\uB2E4.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\uC544\uC9C1 \uD1B5\uD654 \uC911\uC774\uC2E0\uAC00\uC694? \uACC4\uC18D \uB3C4\uC640\uB4DC\uB9B4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    inactivityHangupMessage: "\uC751\uB2F5\uC774 \uC5C6\uC5B4 \uC9C0\uAE08\uC740 \uD1B5\uD654\uB97C \uC885\uB8CC\uD558\uACA0\uC2B5\uB2C8\uB2E4. \uC804\uD654 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var ko_KR_default = koKR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/lt-LT/shared.ts
  var ltLTShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizacija",
    defaultAgentName: "Agentas",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/lt-LT/index.ts
  var feminine18 = {
    abuseDetectedTransferMessage: "Dabar sujungsiu jus su klient\u0173 aptarnavimo komanda.",
    abuseDetectedTerminationMessage: "Atsipra\u0161au, bet negaliu pad\u0117ti d\u0117l \u0161io pra\u0161ymo.",
    ...ltLTShared,
    defaultVoicePersona: "ona-kazlauskaite",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Laba diena, a\u010Di\u016B, kad paskambinote. Esu pasirengusi pad\u0117ti. Kaip galiu \u0161iandien pad\u0117ti?",
    errorMessage: "Susid\u016Briau su technine problema. Atsipra\u0161au u\u017E nepatogumus.",
    inactivityPromptMessage: "Ar vis dar esate linijoje? Esu pasirengusi toliau pad\u0117ti.",
    inactivityHangupMessage: "Pana\u0161u, kad negavau atsakymo. Kol kas baigsiu skambut\u012F. Jei paskambinsite dar kart\u0105, mielai pad\u0117siu. A\u010Di\u016B."
  };
  var masculine18 = {
    abuseDetectedTransferMessage: "Dabar sujungsiu jus su klient\u0173 aptarnavimo komanda.",
    abuseDetectedTerminationMessage: "Atsipra\u0161au, bet negaliu pad\u0117ti d\u0117l \u0161io pra\u0161ymo.",
    ...ltLTShared,
    defaultVoicePersona: "leonas-zukauskas",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Laba diena, a\u010Di\u016B, kad paskambinote. Esu pasireng\u0119s pad\u0117ti. Kaip galiu \u0161iandien pad\u0117ti?",
    errorMessage: "Susid\u016Briau su technine problema. Atsipra\u0161au u\u017E nepatogumus.",
    inactivityPromptMessage: "Ar vis dar esate linijoje? Esu pasireng\u0119s toliau pad\u0117ti.",
    inactivityHangupMessage: "Pana\u0161u, kad negavau atsakymo. Kol kas baigsiu skambut\u012F. Jei paskambinsite dar kart\u0105, mielai pad\u0117siu. A\u010Di\u016B."
  };
  var ltLT = { feminine: feminine18, masculine: masculine18 };
  var lt_LT_default = ltLT;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ms-MY/index.ts
  var msMY = {
    abuseDetectedTransferMessage: "Saya akan sambungkan anda kepada sokongan pelanggan sekarang.",
    abuseDetectedTerminationMessage: "Maaf, saya tidak dapat membantu dengan perkara itu.",
    defaultVoicePersona: "cheryl-lim",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hai, terima kasih kerana menghubungi kami. Bagaimana saya boleh membantu anda hari ini?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisasi",
    defaultAgentName: "Ejen",
    errorMessage: "Saya menghadapi masalah teknikal. Maaf atas kesulitan ini.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Adakah anda masih di sana? Saya sedia untuk terus membantu.",
    inactivityHangupMessage: "Nampaknya saya belum menerima sebarang jawapan, jadi saya akan menamatkan panggilan ini buat masa ini. Terima kasih kerana menghubungi kami.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var ms_MY_default = msMY;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/nb-NO/index.ts
  var nbNO = {
    abuseDetectedTransferMessage: "Jeg setter deg n\xE5 over til kundeservice.",
    abuseDetectedTerminationMessage: "Beklager, men jeg kan ikke hjelpe deg med det.",
    defaultVoicePersona: "colleen-ollson",
    defaultVoiceKeywords: ["Vipps", "Avtalegiro", "Mine sider", "BankID"],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hei, takk for at du ringer. Hvordan kan jeg hjelpe deg i dag?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisasjon",
    defaultAgentName: "Agent",
    errorMessage: "Jeg har st\xF8tt p\xE5 et teknisk problem. Beklager ulempen.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Er du fortsatt der? Jeg er her hvis du fortsatt trenger hjelp.",
    inactivityHangupMessage: "Det virker som jeg ikke har f\xE5tt noe svar, s\xE5 jeg avslutter samtalen n\xE5. Takk for at du ringte.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-norwegian-wording",
      "tone-warm",
      "behavior-conclusive",
      "delivery-expressive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "behavior-curious",
        label: "Curious",
        category: "behavior",
        description: "Asks simple clarifying questions when the customer is unclear.",
        promptContent: [
          "When the user is unclear or stuck, ask simple clarifying questions where needed.",
          "When asking clarifying questions, prefer yes/no questions where appropriate."
        ]
      },
      {
        id: "behavior-focused",
        label: "Focused",
        category: "behavior",
        description: "Politely redirects off-topic conversation back to the task at hand.",
        promptContent: [
          "Stay focused on goals. If the user raises something unrelated, politely redirect to what you can concretely help with."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior"
      },
      {
        id: "style-active-voice",
        label: "Active voice",
        description: "Keeps you as the subject of every action \u2014 'I'll do X' not 'X will be done'.",
        personalityTraitIDs: ["style-active-voice"],
        category: "behavior"
      },
      {
        id: "style-norwegian-wording",
        label: "Norwegian vocabulary",
        category: "behavior",
        description: "Norwegian Bokm\xE5l vocabulary and phrasing conventions for customer service.",
        promptContent: [
          "Use natural Norwegian Bokm\xE5l spelling, vocabulary, and phrasing throughout whenever speaking Norwegian.",
          "When referring to a human support agent, use 'kundeservicemedarbeider' rather than English alternatives such as 'live agent' or 'representative'.",
          "Format numeric dates as dd.mm.yyyy (e.g. '14.05.2026'); the system reads them aloud in spoken Norwegian for you.",
          `When reading back reference codes, invoice numbers, panel IDs, postcodes, OTPs, or other alphanumeric identifiers, wrap the value in a <platform-spell> tag (e.g. <platform-spell group="3">ABC123</platform-spell>) so it is spoken one character at a time in the active voice provider's native style. Do not hand-format identifiers with ellipses or spaces.`,
          "Norwegian mobile and landline phone numbers are 8 digits with no leading zero. Read them in 2-digit blocks. International '+47\u2026' numbers are left as written.",
          "Currency amounts in Norwegian kroner are read as whole numbers with the currency word \u2014 '549 kroner', '1590 kroner', '3490 kroner'. Place a brief comma pause before the amount: 'Bel\xF8pet er, 549 kroner'. Never digit-by-digit. Never with thousands separators. Never as compound Norwegian words such as 'f\xF8rtini'. Use 'krone' singular only for an amount of exactly 1. The subunit is '\xF8re'.",
          "Time ranges are read naturally \u2014 'klokken \xE5tte til tolv', not digit by digit.",
          "After stating any number, code, or monetary amount, briefly offer to repeat it.",
          "Avoid English filler or anglicised wording unless quoting a customer name or a fixed external term."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        description: "All essential details included, broken into clear steps or sentences.",
        personalityTraitIDs: ["style-thorough"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        category: "delivery",
        exclusiveGroup: "delivery-cadence",
        description: "Varied rhythm with restrained emphasis.",
        promptContent: [
          "Vary sentence length to create a natural rhythm.",
          "Avoid explicit filler words such as 'um' or 'uh' unless clearly necessary."
        ]
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Inclusive language that expresses care through clarity rather than enthusiasm.",
        promptContent: [
          "Use inclusive language such as 'vi' or 'la oss' where it feels natural, but do not overuse it.",
          "Express care through clarity and helpfulness rather than enthusiasm."
        ]
      }
    ]
  };
  var nb_NO_default = nbNO;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/nl-BE/index.ts
  var nlBE = {
    abuseDetectedTransferMessage: "Ik verbind u nu door met de klantenservice.",
    abuseDetectedTerminationMessage: "Het spijt me, maar ik kan u daar niet mee helpen.",
    defaultVoicePersona: "dena-janssens",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hallo, bedankt voor uw oproep. Hoe kan ik u vandaag helpen?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisatie",
    defaultAgentName: "Agent",
    errorMessage: "Ik heb een technisch probleem ondervonden. Excuses voor het ongemak.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Bent u er nog? Ik ben hier om u verder te helpen.",
    inactivityHangupMessage: "Het lijkt erop dat ik geen antwoord heb gekregen, dus ik be\xEBindig het gesprek voorlopig. Dank u wel.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var nl_BE_default = nlBE;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/nl-NL/index.ts
  var nlNL = {
    abuseDetectedTransferMessage: "Ik verbind u nu door met de klantenservice.",
    abuseDetectedTerminationMessage: "Het spijt me, maar ik kan u daar niet mee helpen.",
    defaultVoicePersona: "petra-vlaams",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hallo, bedankt voor uw telefoontje. Hoe kan ik u vandaag helpen?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisatie",
    defaultAgentName: "Agent",
    errorMessage: "Ik heb een technisch probleem ondervonden. Excuses voor het ongemak.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Bent u er nog? Ik ben hier om u verder te helpen.",
    inactivityHangupMessage: "Het lijkt erop dat ik geen antwoord heb gekregen, dus ik be\xEBindig het gesprek voorlopig. Dank u wel.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var nl_NL_default = nlNL;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/pl-PL/shared.ts
  var plPLShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organizacja",
    defaultAgentName: "Agent",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/pl-PL/index.ts
  var feminine19 = {
    abuseDetectedTransferMessage: "\u0141\u0105cz\u0119 Ci\u0119 teraz z dzia\u0142em obs\u0142ugi klienta.",
    abuseDetectedTerminationMessage: "Przykro mi, ale nie mog\u0119 pom\xF3c w tej sprawie.",
    ...plPLShared,
    defaultVoicePersona: "julia-wisniewska",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dzie\u0144 dobry, dzi\u0119kuj\u0119 za telefon. Jestem gotowa pom\xF3c. W czym mog\u0119 dzi\u015B pom\xF3c?",
    errorMessage: "Napotka\u0142am problem techniczny. Przepraszam za niedogodno\u015Bci.",
    inactivityPromptMessage: "Czy nadal jeste\u015B na linii? Jestem gotowa kontynuowa\u0107 pomoc.",
    inactivityHangupMessage: "Wygl\u0105da na to, \u017Ce nie ma odpowiedzi. Na razie zako\u0144cz\u0119 po\u0142\u0105czenie. Je\u015Bli zadzwonisz ponownie, b\u0119d\u0119 gotowa pom\xF3c. Dzi\u0119kuj\u0119."
  };
  var masculine19 = {
    abuseDetectedTransferMessage: "\u0141\u0105cz\u0119 Ci\u0119 teraz z dzia\u0142em obs\u0142ugi klienta.",
    abuseDetectedTerminationMessage: "Przykro mi, ale nie mog\u0119 pom\xF3c w tej sprawie.",
    ...plPLShared,
    defaultVoicePersona: "maxim-nowak",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dzie\u0144 dobry, dzi\u0119kuj\u0119 za telefon. Jestem got\xF3w pom\xF3c. W czym mog\u0119 dzi\u015B pom\xF3c?",
    errorMessage: "Napotka\u0142em problem techniczny. Przepraszam za niedogodno\u015Bci.",
    inactivityPromptMessage: "Czy nadal jeste\u015B na linii? Jestem got\xF3w kontynuowa\u0107 pomoc.",
    inactivityHangupMessage: "Wygl\u0105da na to, \u017Ce nie ma odpowiedzi. Na razie zako\u0144cz\u0119 po\u0142\u0105czenie. Je\u015Bli zadzwonisz ponownie, b\u0119d\u0119 got\xF3w pom\xF3c. Dzi\u0119kuj\u0119."
  };
  var plPL = { feminine: feminine19, masculine: masculine19 };
  var pl_PL_default = plPL;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/pt-BR/shared.ts
  var ptBRShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organiza\xE7\xE3o",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/pt-BR/index.ts
  var feminine20 = {
    abuseDetectedTransferMessage: "Vou transferir voc\xEA agora para o nosso atendimento ao cliente.",
    abuseDetectedTerminationMessage: "Desculpe, mas n\xE3o posso ajudar com essa solicita\xE7\xE3o.",
    ...ptBRShared,
    defaultVoicePersona: "daniela-costa",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Ol\xE1, obrigada por ligar. Estou pronta para ajudar. Como posso ajudar hoje?",
    errorMessage: "Encontrei um problema t\xE9cnico. Desculpe pelo inconveniente.",
    inactivityPromptMessage: "Voc\xEA ainda est\xE1 a\xED? Estou pronta para continuar ajudando.",
    inactivityHangupMessage: "Parece que n\xE3o recebi uma resposta. Vou encerrar a liga\xE7\xE3o por enquanto. Se voc\xEA ligar novamente, ficarei feliz em ajudar. Obrigada."
  };
  var masculine20 = {
    abuseDetectedTransferMessage: "Vou transferir voc\xEA agora para o nosso atendimento ao cliente.",
    abuseDetectedTerminationMessage: "Desculpe, mas n\xE3o posso ajudar com essa solicita\xE7\xE3o.",
    ...ptBRShared,
    defaultVoicePersona: "estive-almeida",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Ol\xE1, obrigado por ligar. Estou pronto para ajudar. Como posso ajudar hoje?",
    errorMessage: "Encontrei um problema t\xE9cnico. Desculpe pelo inconveniente.",
    inactivityPromptMessage: "Voc\xEA ainda est\xE1 a\xED? Estou pronto para continuar ajudando.",
    inactivityHangupMessage: "Parece que n\xE3o recebi uma resposta. Vou encerrar a liga\xE7\xE3o por enquanto. Se voc\xEA ligar novamente, ficarei feliz em ajudar. Obrigado."
  };
  var ptBR = { feminine: feminine20, masculine: masculine20 };
  var pt_BR_default = ptBR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/pt-PT/shared.ts
  var ptPTShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organiza\xE7\xE3o",
    defaultAgentName: "Agente",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/pt-PT/index.ts
  var feminine21 = {
    abuseDetectedTransferMessage: "Vou transferir a chamada agora para o nosso apoio ao cliente.",
    abuseDetectedTerminationMessage: "Lamento, mas n\xE3o posso ajudar com esse pedido.",
    ...ptPTShared,
    defaultVoicePersona: "sofia-carvalho",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Ol\xE1, obrigada por ligar. Estou pronta para ajudar. Como posso ajudar hoje?",
    errorMessage: "Encontrei um problema t\xE9cnico. Lamento o inc\xF3modo.",
    inactivityPromptMessage: "Ainda est\xE1 a\xED? Estou pronta para continuar a ajudar.",
    inactivityHangupMessage: "Parece que n\xE3o recebi resposta. Vou encerrar a chamada por agora. Se voltar a ligar, terei todo o gosto em ajudar. Obrigada."
  };
  var masculine21 = {
    abuseDetectedTransferMessage: "Vou transferir a chamada agora para o nosso apoio ao cliente.",
    abuseDetectedTerminationMessage: "Lamento, mas n\xE3o posso ajudar com esse pedido.",
    ...ptPTShared,
    defaultVoicePersona: "patricio-vieira",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Ol\xE1, obrigado por ligar. Estou pronto para ajudar. Como posso ajudar hoje?",
    errorMessage: "Encontrei um problema t\xE9cnico. Lamento o inc\xF3modo.",
    inactivityPromptMessage: "Ainda est\xE1 a\xED? Estou pronto para continuar a ajudar.",
    inactivityHangupMessage: "Parece que n\xE3o recebi resposta. Vou encerrar a chamada por agora. Se voltar a ligar, terei todo o gosto em ajudar. Obrigado."
  };
  var ptPT = { feminine: feminine21, masculine: masculine21 };
  var pt_PT_default = ptPT;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ro-RO/shared.ts
  var roROShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organiza\u021Bie",
    defaultAgentName: "Agent",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ro-RO/index.ts
  var feminine22 = {
    abuseDetectedTransferMessage: "V\u0103 transfer acum c\u0103tre serviciul nostru de asisten\u021B\u0103 pentru clien\u021Bi.",
    abuseDetectedTerminationMessage: "\xCEmi pare r\u0103u, dar nu v\u0103 pot ajuta cu aceast\u0103 solicitare.",
    ...roROShared,
    defaultVoicePersona: "ana-maria-ionescu",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Bun\u0103 ziua, v\u0103 mul\u021Bumesc pentru apel. Sunt preg\u0103tit\u0103 s\u0103 v\u0103 ajut. Cu ce v\u0103 pot ajuta ast\u0103zi?",
    errorMessage: "Am \xEEnt\xE2mpinat o problem\u0103 tehnic\u0103. \xCEmi pare r\u0103u pentru inconvenient.",
    inactivityPromptMessage: "Mai sunte\u021Bi acolo? Sunt preg\u0103tit\u0103 s\u0103 continui s\u0103 v\u0103 ajut.",
    inactivityHangupMessage: "Se pare c\u0103 nu am primit niciun r\u0103spuns. Voi \xEEncheia apelul pentru moment. Dac\u0103 reveni\u021Bi cu un apel, voi fi bucuroas\u0103 s\u0103 v\u0103 ajut. Mul\u021Bumesc."
  };
  var masculine22 = {
    abuseDetectedTransferMessage: "V\u0103 transfer acum c\u0103tre serviciul nostru de asisten\u021B\u0103 pentru clien\u021Bi.",
    abuseDetectedTerminationMessage: "\xCEmi pare r\u0103u, dar nu v\u0103 pot ajuta cu aceast\u0103 solicitare.",
    ...roROShared,
    defaultVoicePersona: "mihai-popescu",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Bun\u0103 ziua, v\u0103 mul\u021Bumesc pentru apel. Sunt preg\u0103tit s\u0103 v\u0103 ajut. Cu ce v\u0103 pot ajuta ast\u0103zi?",
    errorMessage: "Am \xEEnt\xE2mpinat o problem\u0103 tehnic\u0103. \xCEmi pare r\u0103u pentru inconvenient.",
    inactivityPromptMessage: "Mai sunte\u021Bi acolo? Sunt preg\u0103tit s\u0103 continui s\u0103 v\u0103 ajut.",
    inactivityHangupMessage: "Se pare c\u0103 nu am primit niciun r\u0103spuns. Voi \xEEncheia apelul pentru moment. Dac\u0103 reveni\u021Bi cu un apel, voi fi bucuros s\u0103 v\u0103 ajut. Mul\u021Bumesc."
  };
  var roRO = { feminine: feminine22, masculine: masculine22 };
  var ro_RO_default = roRO;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ru-RU/shared.ts
  var ruRUShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F",
    defaultAgentName: "\u0410\u0433\u0435\u043D\u0442",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ru-RU/index.ts
  var feminine23 = {
    abuseDetectedTransferMessage: "\u0421\u0435\u0439\u0447\u0430\u0441 \u044F \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0443 \u0432\u0430\u0441 \u043D\u0430 \u043D\u0430\u0448\u0443 \u0441\u043B\u0443\u0436\u0431\u0443 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432.",
    abuseDetectedTerminationMessage: "\u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435, \u043D\u043E \u044F \u043D\u0435 \u043C\u043E\u0433\u0443 \u043F\u043E\u043C\u043E\u0447\u044C \u0441 \u044D\u0442\u0438\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C.",
    ...ruRUShared,
    defaultVoicePersona: "larisa-actrisa",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, \u0441\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0437\u0432\u043E\u043D\u043E\u043A. \u042F \u0433\u043E\u0442\u043E\u0432\u0430 \u043F\u043E\u043C\u043E\u0447\u044C. \u0427\u0435\u043C \u044F \u043C\u043E\u0433\u0443 \u043F\u043E\u043C\u043E\u0447\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F?",
    errorMessage: "\u0412\u043E\u0437\u043D\u0438\u043A\u043B\u0430 \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430. \u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435 \u0437\u0430 \u043D\u0435\u0443\u0434\u043E\u0431\u0441\u0442\u0432\u0430.",
    inactivityPromptMessage: "\u0412\u044B \u0435\u0449\u0435 \u043D\u0430 \u043B\u0438\u043D\u0438\u0438? \u042F \u0433\u043E\u0442\u043E\u0432\u0430 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0438 \u043F\u043E\u043C\u043E\u0447\u044C.",
    inactivityHangupMessage: "\u041F\u043E\u0445\u043E\u0436\u0435, \u044F \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0430 \u043E\u0442\u0432\u0435\u0442\u0430. \u042F \u0437\u0430\u0432\u0435\u0440\u0448\u0443 \u0437\u0432\u043E\u043D\u043E\u043A \u043D\u0430 \u044D\u0442\u043E\u043C. \u0415\u0441\u043B\u0438 \u0432\u044B \u043F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u0435 \u0441\u043D\u043E\u0432\u0430, \u044F \u0431\u0443\u0434\u0443 \u0440\u0430\u0434\u0430 \u043F\u043E\u043C\u043E\u0447\u044C. \u0421\u043F\u0430\u0441\u0438\u0431\u043E."
  };
  var masculine23 = {
    abuseDetectedTransferMessage: "\u0421\u0435\u0439\u0447\u0430\u0441 \u044F \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0443 \u0432\u0430\u0441 \u043D\u0430 \u043D\u0430\u0448\u0443 \u0441\u043B\u0443\u0436\u0431\u0443 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432.",
    abuseDetectedTerminationMessage: "\u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435, \u043D\u043E \u044F \u043D\u0435 \u043C\u043E\u0433\u0443 \u043F\u043E\u043C\u043E\u0447\u044C \u0441 \u044D\u0442\u0438\u043C \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u043C.",
    ...ruRUShared,
    defaultVoicePersona: "nikolay-ivanov",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, \u0441\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0437\u0432\u043E\u043D\u043E\u043A. \u042F \u0433\u043E\u0442\u043E\u0432 \u043F\u043E\u043C\u043E\u0447\u044C. \u0427\u0435\u043C \u044F \u043C\u043E\u0433\u0443 \u043F\u043E\u043C\u043E\u0447\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F?",
    errorMessage: "\u0412\u043E\u0437\u043D\u0438\u043A\u043B\u0430 \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430. \u0418\u0437\u0432\u0438\u043D\u0438\u0442\u0435 \u0437\u0430 \u043D\u0435\u0443\u0434\u043E\u0431\u0441\u0442\u0432\u0430.",
    inactivityPromptMessage: "\u0412\u044B \u0435\u0449\u0435 \u043D\u0430 \u043B\u0438\u043D\u0438\u0438? \u042F \u0433\u043E\u0442\u043E\u0432 \u043F\u043E\u043C\u043E\u0447\u044C \u0438 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C.",
    inactivityHangupMessage: "\u041F\u043E\u0445\u043E\u0436\u0435, \u044F \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442\u0432\u0435\u0442\u0430. \u042F \u0437\u0430\u0432\u0435\u0440\u0448\u0443 \u0437\u0432\u043E\u043D\u043E\u043A \u043D\u0430 \u044D\u0442\u043E\u043C. \u0415\u0441\u043B\u0438 \u0432\u044B \u043F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u0435 \u0441\u043D\u043E\u0432\u0430, \u044F \u0431\u0443\u0434\u0443 \u0440\u0430\u0434 \u043F\u043E\u043C\u043E\u0447\u044C. \u0421\u043F\u0430\u0441\u0438\u0431\u043E."
  };
  var ruRU = { feminine: feminine23, masculine: masculine23 };
  var ru_RU_default = ruRU;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/sk-SK/shared.ts
  var skSKShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organiz\xE1cia",
    defaultAgentName: "Agent",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/sk-SK/index.ts
  var feminine24 = {
    abuseDetectedTransferMessage: "Teraz v\xE1s prep\xE1jam na z\xE1kazn\xEDcku podporu.",
    abuseDetectedTerminationMessage: "Je mi \u013E\xFAto, ale s touto po\u017Eiadavkou v\xE1m nem\xF4\u017Eem pom\xF4c\u0165.",
    ...skSKShared,
    defaultVoicePersona: "zuzana-novakova",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dobr\xFD de\u0148, \u010Fakujem za zavolanie. Som pripraven\xE1 pom\xF4c\u0165. Ako v\xE1m dnes m\xF4\u017Eem pom\xF4c\u0165?",
    errorMessage: "Do\u0161lo k technick\xE9mu probl\xE9mu. Ospravedl\u0148ujem sa za komplik\xE1cie.",
    inactivityPromptMessage: "Ste st\xE1le na linke? Som pripraven\xE1 pokra\u010Dova\u0165 a pom\xF4c\u0165.",
    inactivityHangupMessage: "Zd\xE1 sa, \u017Ee som nedostala odpove\u010F. Hovor zatia\u013E ukon\u010D\xEDm. Ak zavol\xE1te znova, rada pom\xF4\u017Eem. \u010Eakujem."
  };
  var masculine24 = {
    abuseDetectedTransferMessage: "Teraz v\xE1s prep\xE1jam na z\xE1kazn\xEDcku podporu.",
    abuseDetectedTerminationMessage: "Je mi \u013E\xFAto, ale s touto po\u017Eiadavkou v\xE1m nem\xF4\u017Eem pom\xF4c\u0165.",
    ...skSKShared,
    defaultVoicePersona: "peter-horvath",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Dobr\xFD de\u0148, \u010Fakujem za zavolanie. Som pripraven\xFD pom\xF4c\u0165. Ako v\xE1m dnes m\xF4\u017Eem pom\xF4c\u0165?",
    errorMessage: "Do\u0161lo k technick\xE9mu probl\xE9mu. Ospravedl\u0148ujem sa za komplik\xE1cie.",
    inactivityPromptMessage: "Ste st\xE1le na linke? Som pripraven\xFD pokra\u010Dova\u0165 a pom\xF4c\u0165.",
    inactivityHangupMessage: "Zd\xE1 sa, \u017Ee som nedostal odpove\u010F. Hovor zatia\u013E ukon\u010D\xEDm. Ak zavol\xE1te znova, r\xE1d pom\xF4\u017Eem. \u010Eakujem."
  };
  var skSK = { feminine: feminine24, masculine: masculine24 };
  var sk_SK_default = skSK;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/sv-SE/index.ts
  var svSE = {
    abuseDetectedTransferMessage: "Jag kopplar dig nu till kundtj\xE4nst.",
    abuseDetectedTerminationMessage: "Jag \xE4r ledsen, men jag kan inte hj\xE4lpa dig med det.",
    defaultVoicePersona: "camilla-bard",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hej, tack f\xF6r att du ringer. Hur kan jag hj\xE4lpa dig idag?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisation",
    defaultAgentName: "Agent",
    errorMessage: "Jag har st\xF6tt p\xE5 ett tekniskt problem. Jag beklagar besv\xE4ret.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\xC4r du kvar? Jag finns h\xE4r om du fortfarande beh\xF6ver hj\xE4lp.",
    inactivityHangupMessage: "Det verkar som att jag inte har f\xE5tt n\xE5got svar, s\xE5 jag avslutar samtalet nu. Tack f\xF6r att du ringde.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: [
      "standard-customer-service",
      "base-channel-optimization",
      "style-swedish-wording",
      "tone-warm",
      "behavior-conclusive",
      "delivery-expressive"
    ],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        label: "Optimise by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email.",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ]
      },
      {
        id: "behavior-curious",
        label: "Curious",
        category: "behavior",
        description: "Asks simple clarifying questions when the customer is unclear.",
        promptContent: [
          "When the user is unclear or stuck, ask simple clarifying questions where needed.",
          "When asking clarifying questions, prefer yes/no questions where appropriate."
        ]
      },
      {
        id: "behavior-focused",
        label: "Focused",
        category: "behavior",
        description: "Politely redirects off-topic conversation back to the task at hand.",
        promptContent: [
          "Stay focused on goals. If the user raises something unrelated, politely redirect to what you can concretely help with."
        ]
      },
      {
        id: "behavior-conclusive",
        label: "Conclusive",
        description: 'Ends responses definitively \u2014 no trailing "anything else?" or open-ended alternatives.',
        personalityTraitIDs: ["behavior-conclusive"],
        category: "behavior"
      },
      {
        id: "style-active-voice",
        label: "Active voice",
        description: "Keeps you as the subject of every action \u2014 'I'll do X' not 'X will be done'.",
        personalityTraitIDs: ["style-active-voice"],
        category: "behavior"
      },
      {
        id: "style-swedish-wording",
        label: "Swedish vocabulary",
        category: "behavior",
        description: "Swedish vocabulary and phrasing conventions for customer service.",
        promptContent: [
          "Use natural Swedish spelling, vocabulary, and phrasing throughout whenever speaking Swedish.",
          "When referring to a human support agent, use 'kundsupportmedarbetare' rather than English alternatives such as 'live agent' or 'representative'.",
          "Format numeric dates as yyyy-mm-dd (e.g. '2026-05-14'), and read them as 'den fjortonde maj tjugohundratjugosex'.",
          "Swedish mobile numbers may appear in international form (+46701234567) or local 10-digit form (0701234567). Accept either for identification, but always read them back in local form without the '+46' prefix.",
          "Time ranges are read naturally in Swedish, not digit by digit \u2014 'klockan \xE5tta till tolv', not 'klockan 8 till 12'.",
          "Place a brief comma pause before reading an amount or critical number aloud \u2014 'Beloppet \xE4r, 549 kronor', not 'Beloppet \xE4r 549 kronor'. Same pattern applies to invoice numbers and other critical figures.",
          "Do not insert thousands separators into spoken Swedish amounts. Read them as a single integer plus 'kronor' (and '\xF6re' for the subunit) \u2014 never digit by digit, never as compound Swedish words such as 'fyrtionio'.",
          "Never compress numbers, codes, or critical data into compound or abbreviated forms \u2014 clarity wins over brevity for anything the customer needs to remember or copy.",
          "After stating any number, code, or monetary amount, briefly offer to repeat it ('Vill du att jag upprepar?').",
          "Use polite Swedish question forms ('Kan du ber\xE4tta\u2026?', 'Skulle du kunna\u2026?') when requesting information.",
          "Avoid English filler or anglicised wording unless quoting a customer name or a fixed external term."
        ]
      },
      {
        id: "style-professional",
        label: "Professional",
        description: "Polished, business-appropriate language. Precise wording, structured sentences, no slang.",
        personalityTraitIDs: ["style-professional"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-conversational",
        label: "Conversational",
        description: "Clear, natural phrasing with contractions and simple sentence structure.",
        personalityTraitIDs: ["style-conversational"],
        category: "demeanor",
        exclusiveGroup: "style-register"
      },
      {
        id: "style-concise",
        label: "Concise",
        description: "Short sentences, most important information first, no filler or repetition.",
        personalityTraitIDs: ["style-concise"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "style-thorough",
        label: "Thorough",
        description: "All essential details included, broken into clear steps or sentences.",
        personalityTraitIDs: ["style-thorough"],
        category: "verbosity",
        exclusiveGroup: "style-detail"
      },
      {
        id: "delivery-crisp",
        label: "Crisp",
        description: "Tight, efficient phrasing with short sentences and minimal punctuation variety.",
        personalityTraitIDs: ["delivery-crisp"],
        category: "delivery",
        exclusiveGroup: "delivery-cadence"
      },
      {
        id: "delivery-expressive",
        label: "Expressive",
        category: "delivery",
        exclusiveGroup: "delivery-cadence",
        description: "Varied rhythm with restrained emphasis.",
        promptContent: [
          "Vary sentence length to create a natural rhythm.",
          "Avoid explicit filler words such as 'um' or 'uh' unless clearly necessary."
        ]
      },
      {
        id: "tone-tactful",
        label: "Tactful",
        description: "Diplomatic, respectful language that softens corrections and avoids assigning blame.",
        personalityTraitIDs: ["tone-tactful"],
        category: "tone",
        exclusiveGroup: "tone-posture"
      },
      {
        id: "tone-warm",
        label: "Warm",
        category: "tone",
        exclusiveGroup: "tone-posture",
        description: "Inclusive language that expresses care through clarity rather than enthusiasm.",
        promptContent: [
          "Use inclusive language such as 'vi' or 'l\xE5t oss' where it feels natural, but do not overuse it.",
          "Express care through clarity and helpfulness rather than enthusiasm."
        ]
      }
    ]
  };
  var sv_SE_default = svSE;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/th-TH/shared.ts
  var thTHShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23",
    defaultAgentName: "\u0E40\u0E2D\u0E40\u0E08\u0E19\u0E15\u0E4C",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/th-TH/index.ts
  var feminine25 = {
    abuseDetectedTransferMessage: "\u0E09\u0E31\u0E19\u0E08\u0E30\u0E42\u0E2D\u0E19\u0E2A\u0E32\u0E22\u0E04\u0E38\u0E13\u0E44\u0E1B\u0E22\u0E31\u0E07\u0E1D\u0E48\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E04\u0E48\u0E30",
    abuseDetectedTerminationMessage: "\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22\u0E04\u0E48\u0E30 \u0E09\u0E31\u0E19\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E0A\u0E48\u0E27\u0E22\u0E43\u0E19\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E19\u0E31\u0E49\u0E19\u0E44\u0E14\u0E49",
    ...thTHShared,
    defaultVoicePersona: "nok-sudjai",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35\u0E04\u0E48\u0E30 \u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E17\u0E35\u0E48\u0E42\u0E17\u0E23\u0E21\u0E32 \u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E43\u0E2B\u0E49\u0E09\u0E31\u0E19\u0E0A\u0E48\u0E27\u0E22\u0E2D\u0E30\u0E44\u0E23\u0E44\u0E14\u0E49\u0E1A\u0E49\u0E32\u0E07\u0E04\u0E30?",
    errorMessage: "\u0E09\u0E31\u0E19\u0E1E\u0E1A\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E17\u0E32\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04 \u0E15\u0E49\u0E2D\u0E07\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22\u0E43\u0E19\u0E04\u0E27\u0E32\u0E21\u0E44\u0E21\u0E48\u0E2A\u0E30\u0E14\u0E27\u0E01\u0E04\u0E48\u0E30",
    inactivityPromptMessage: "\u0E22\u0E31\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E2A\u0E32\u0E22\u0E44\u0E2B\u0E21\u0E04\u0E30 \u0E09\u0E31\u0E19\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E15\u0E48\u0E2D\u0E04\u0E48\u0E30",
    inactivityHangupMessage: "\u0E14\u0E39\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E27\u0E48\u0E32\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E04\u0E33\u0E15\u0E2D\u0E1A \u0E09\u0E31\u0E19\u0E08\u0E30\u0E27\u0E32\u0E07\u0E2A\u0E32\u0E22\u0E44\u0E27\u0E49\u0E01\u0E48\u0E2D\u0E19\u0E19\u0E30\u0E04\u0E30 \u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E17\u0E35\u0E48\u0E42\u0E17\u0E23\u0E21\u0E32"
  };
  var masculine25 = {
    abuseDetectedTransferMessage: "\u0E1C\u0E21\u0E08\u0E30\u0E42\u0E2D\u0E19\u0E2A\u0E32\u0E22\u0E04\u0E38\u0E13\u0E44\u0E1B\u0E22\u0E31\u0E07\u0E1D\u0E48\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E04\u0E23\u0E31\u0E1A",
    abuseDetectedTerminationMessage: "\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22\u0E04\u0E23\u0E31\u0E1A \u0E1C\u0E21\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E0A\u0E48\u0E27\u0E22\u0E43\u0E19\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E19\u0E31\u0E49\u0E19\u0E44\u0E14\u0E49",
    ...thTHShared,
    defaultVoicePersona: "krit-anurak",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35\u0E04\u0E23\u0E31\u0E1A \u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E17\u0E35\u0E48\u0E42\u0E17\u0E23\u0E21\u0E32 \u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E43\u0E2B\u0E49\u0E1C\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E2D\u0E30\u0E44\u0E23\u0E44\u0E14\u0E49\u0E1A\u0E49\u0E32\u0E07\u0E04\u0E23\u0E31\u0E1A?",
    errorMessage: "\u0E1C\u0E21\u0E1E\u0E1A\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E17\u0E32\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04 \u0E15\u0E49\u0E2D\u0E07\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22\u0E43\u0E19\u0E04\u0E27\u0E32\u0E21\u0E44\u0E21\u0E48\u0E2A\u0E30\u0E14\u0E27\u0E01\u0E04\u0E23\u0E31\u0E1A",
    inactivityPromptMessage: "\u0E22\u0E31\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E2A\u0E32\u0E22\u0E44\u0E2B\u0E21\u0E04\u0E23\u0E31\u0E1A \u0E1C\u0E21\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E15\u0E48\u0E2D\u0E04\u0E23\u0E31\u0E1A",
    inactivityHangupMessage: "\u0E14\u0E39\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E27\u0E48\u0E32\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E04\u0E33\u0E15\u0E2D\u0E1A \u0E1C\u0E21\u0E08\u0E30\u0E27\u0E32\u0E07\u0E2A\u0E32\u0E22\u0E44\u0E27\u0E49\u0E01\u0E48\u0E2D\u0E19\u0E19\u0E30\u0E04\u0E23\u0E31\u0E1A \u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E17\u0E35\u0E48\u0E42\u0E17\u0E23\u0E21\u0E32"
  };
  var thTH = { feminine: feminine25, masculine: masculine25 };
  var th_TH_default = thTH;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/tl-PH/index.ts
  var tlPH = {
    abuseDetectedTransferMessage: "Ikokonekta na kita sa customer support ngayon.",
    abuseDetectedTerminationMessage: "Paumanhin, pero hindi kita matutulungan diyan.",
    defaultVoicePersona: "kristel-bautista",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Hello, salamat sa pagtawag. Paano kita matutulungan ngayon?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Organisasyon",
    defaultAgentName: "Ahente",
    errorMessage: "Nagkaroon ako ng teknikal na problema. Paumanhin sa abala.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Nandiyan ka pa ba? Narito pa rin ako para tumulong.",
    inactivityHangupMessage: "Mukhang wala akong narinig na sagot, kaya tatapusin ko muna ang tawag. Salamat sa pagtawag.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      },
      {
        id: "taglish-code-switching",
        label: "Taglish code-switching",
        description: "Match the customer's English/Tagalog/Taglish mix per turn, with consistent leveling.",
        category: "behavior",
        promptContextHeading: "Language Matching",
        promptContent: [
          "Respond in the customer's language.",
          "If the customer speaks English only, respond in clear professional English with zero Filipino words.",
          "If the customer uses Tagalog or Taglish, match their language level naturally.",
          "If the customer shifts language mid-conversation, follow the new style immediately.",
          "Do not announce language detection or locale switching.",
          "Before every reply, silently review the customer's last 2-3 messages to pick a Taglish level.",
          "Level 2 - English-first Taglish: response leans English overall, with light Filipino phrases or connectors when natural.",
          "Level 3 - Balanced Taglish: mix English and Filipino naturally. Use Filipino for short acknowledgements and action guidance while keeping product/technical terms in English.",
          "Level 4 - Filipino-dominant Taglish: Filipino carries the sentence structure; keep product, brand, and domain terms in English.",
          "Level 5 - Pure Tagalog: use natural Tagalog, but keep fixed product/brand terms in English when customers would expect them.",
          "Do not mix levels within a single response. Choose the level that best matches the customer and stay consistent for that turn.",
          "Use English for numbers, dates, currencies, phone numbers, and reference codes.",
          "Mirror 'po' and 'opo' when the customer uses them, but never just sprinkle 'po' onto English."
        ]
      }
    ]
  };
  var tl_PH_default = tlPH;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/tr-TR/index.ts
  var trTR = {
    abuseDetectedTransferMessage: "Sizi \u015Fimdi m\xFC\u015Fteri hizmetlerine aktar\u0131yorum.",
    abuseDetectedTerminationMessage: "\xDCzg\xFCn\xFCm, ancak bu konuda yard\u0131mc\u0131 olamam.",
    defaultVoicePersona: "gunnur-ozturk",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Merhaba, arad\u0131\u011F\u0131n\u0131z i\xE7in te\u015Fekk\xFCrler. Bug\xFCn size nas\u0131l yard\u0131mc\u0131 olabilirim?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Kurulu\u015F",
    defaultAgentName: "Temsilci",
    errorMessage: "Teknik bir sorunla kar\u015F\u0131la\u015Ft\u0131m. Ya\u015Fanan aksakl\u0131k i\xE7in \xF6z\xFCr dilerim.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "H\xE2l\xE2 hatta m\u0131s\u0131n\u0131z? Yard\u0131m etmeye haz\u0131r\u0131m.",
    inactivityHangupMessage: "G\xF6r\xFCn\xFC\u015Fe g\xF6re yan\u0131t alamad\u0131m. \u015Eimdilik aramay\u0131 sonland\u0131raca\u011F\u0131m. Te\u015Fekk\xFCr ederim.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var tr_TR_default = trTR;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/uk-UA/shared.ts
  var ukUAShared = {
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u041E\u0440\u0433\u0430\u043D\u0456\u0437\u0430\u0446\u0456\u044F",
    defaultAgentName: "\u0410\u0433\u0435\u043D\u0442",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/uk-UA/index.ts
  var feminine26 = {
    abuseDetectedTransferMessage: "\u0417\u0430\u0440\u0430\u0437 \u044F \u0437\u2019\u0454\u0434\u043D\u0430\u044E \u0432\u0430\u0441 \u0437\u0456 \u0441\u043B\u0443\u0436\u0431\u043E\u044E \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0438 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432.",
    abuseDetectedTerminationMessage: "\u0412\u0438\u0431\u0430\u0447\u0442\u0435, \u0430\u043B\u0435 \u044F \u043D\u0435 \u043C\u043E\u0436\u0443 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438 \u0437 \u0446\u0438\u043C \u0437\u0430\u043F\u0438\u0442\u043E\u043C.",
    ...ukUAShared,
    defaultVoicePersona: "mariya-maro",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0412\u0456\u0442\u0430\u044E, \u0434\u044F\u043A\u0443\u044E \u0437\u0430 \u0434\u0437\u0432\u0456\u043D\u043E\u043A. \u042F \u0433\u043E\u0442\u043E\u0432\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438. \u0427\u0438\u043C \u043C\u043E\u0436\u0443 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438 \u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456?",
    errorMessage: "\u0412\u0438\u043D\u0438\u043A\u043B\u0430 \u0442\u0435\u0445\u043D\u0456\u0447\u043D\u0430 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430. \u041F\u0435\u0440\u0435\u043F\u0440\u043E\u0448\u0443\u044E \u0437\u0430 \u043D\u0435\u0437\u0440\u0443\u0447\u043D\u043E\u0441\u0442\u0456.",
    inactivityPromptMessage: "\u0412\u0438 \u0449\u0435 \u043D\u0430 \u043B\u0456\u043D\u0456\u0457? \u042F \u0433\u043E\u0442\u043E\u0432\u0430 \u043F\u0440\u043E\u0434\u043E\u0432\u0436\u0438\u0442\u0438 \u0442\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438.",
    inactivityHangupMessage: "\u0421\u0445\u043E\u0436\u0435, \u044F \u043D\u0435 \u043E\u0442\u0440\u0438\u043C\u0430\u043B\u0430 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456. \u041D\u0430\u0440\u0430\u0437\u0456 \u0437\u0430\u0432\u0435\u0440\u0448\u0443 \u0434\u0437\u0432\u0456\u043D\u043E\u043A. \u042F\u043A\u0449\u043E \u0432\u0438 \u0437\u0430\u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0443\u0454\u0442\u0435 \u0437\u043D\u043E\u0432\u0443, \u044F \u0456\u0437 \u0437\u0430\u0434\u043E\u0432\u043E\u043B\u0435\u043D\u043D\u044F\u043C \u0434\u043E\u043F\u043E\u043C\u043E\u0436\u0443. \u0414\u044F\u043A\u0443\u044E."
  };
  var masculine26 = {
    abuseDetectedTransferMessage: "\u0417\u0430\u0440\u0430\u0437 \u044F \u0437\u2019\u0454\u0434\u043D\u0430\u044E \u0432\u0430\u0441 \u0437\u0456 \u0441\u043B\u0443\u0436\u0431\u043E\u044E \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0438 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432.",
    abuseDetectedTerminationMessage: "\u0412\u0438\u0431\u0430\u0447\u0442\u0435, \u0430\u043B\u0435 \u044F \u043D\u0435 \u043C\u043E\u0436\u0443 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438 \u0437 \u0446\u0438\u043C \u0437\u0430\u043F\u0438\u0442\u043E\u043C.",
    ...ukUAShared,
    defaultVoicePersona: "anton-shevchenko",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u0412\u0456\u0442\u0430\u044E, \u0434\u044F\u043A\u0443\u044E \u0437\u0430 \u0434\u0437\u0432\u0456\u043D\u043E\u043A. \u042F \u0433\u043E\u0442\u043E\u0432\u0438\u0439 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438. \u0427\u0438\u043C \u043C\u043E\u0436\u0443 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438 \u0441\u044C\u043E\u0433\u043E\u0434\u043D\u0456?",
    errorMessage: "\u0412\u0438\u043D\u0438\u043A\u043B\u0430 \u0442\u0435\u0445\u043D\u0456\u0447\u043D\u0430 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430. \u041F\u0435\u0440\u0435\u043F\u0440\u043E\u0448\u0443\u044E \u0437\u0430 \u043D\u0435\u0437\u0440\u0443\u0447\u043D\u043E\u0441\u0442\u0456.",
    inactivityPromptMessage: "\u0412\u0438 \u0449\u0435 \u043D\u0430 \u043B\u0456\u043D\u0456\u0457? \u042F \u0433\u043E\u0442\u043E\u0432\u0438\u0439 \u043F\u0440\u043E\u0434\u043E\u0432\u0436\u0438\u0442\u0438 \u0442\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438.",
    inactivityHangupMessage: "\u0421\u0445\u043E\u0436\u0435, \u044F \u043D\u0435 \u043E\u0442\u0440\u0438\u043C\u0430\u0432 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456. \u041D\u0430\u0440\u0430\u0437\u0456 \u0437\u0430\u0432\u0435\u0440\u0448\u0443 \u0434\u0437\u0432\u0456\u043D\u043E\u043A. \u042F\u043A\u0449\u043E \u0432\u0438 \u0437\u0430\u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0443\u0454\u0442\u0435 \u0437\u043D\u043E\u0432\u0443, \u044F \u0456\u0437 \u0437\u0430\u0434\u043E\u0432\u043E\u043B\u0435\u043D\u043D\u044F\u043C \u0434\u043E\u043F\u043E\u043C\u043E\u0436\u0443. \u0414\u044F\u043A\u0443\u044E."
  };
  var ukUA = { feminine: feminine26, masculine: masculine26 };
  var uk_UA_default = ukUA;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/vi-VN/index.ts
  var viVN = {
    abuseDetectedTransferMessage: "T\xF4i s\u1EBD k\u1EBFt n\u1ED1i b\u1EA1n v\u1EDBi b\u1ED9 ph\u1EADn h\u1ED7 tr\u1EE3 kh\xE1ch h\xE0ng ngay b\xE2y gi\u1EDD.",
    abuseDetectedTerminationMessage: "Xin l\u1ED7i, nh\u01B0ng t\xF4i kh\xF4ng th\u1EC3 h\u1ED7 tr\u1EE3 vi\u1EC7c \u0111\xF3.",
    defaultVoicePersona: "huyen-tran",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Xin ch\xE0o, c\u1EA3m \u01A1n b\u1EA1n \u0111\xE3 g\u1ECDi. H\xF4m nay t\xF4i c\xF3 th\u1EC3 gi\xFAp g\xEC cho b\u1EA1n?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "T\u1ED5 ch\u1EE9c",
    defaultAgentName: "T\xE1c nh\xE2n",
    errorMessage: "T\xF4i g\u1EB7p s\u1EF1 c\u1ED1 k\u1EF9 thu\u1EADt. Xin l\u1ED7i v\xEC s\u1EF1 b\u1EA5t ti\u1EC7n n\xE0y.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "B\u1EA1n v\u1EABn c\xF2n \u1EDF \u0111\xF3 ch\u1EE9? T\xF4i s\u1EB5n s\xE0ng ti\u1EBFp t\u1EE5c h\u1ED7 tr\u1EE3.",
    inactivityHangupMessage: "C\xF3 v\u1EBB nh\u01B0 t\xF4i ch\u01B0a nh\u1EADn \u0111\u01B0\u1EE3c ph\u1EA3n h\u1ED3i, n\xEAn t\xF4i s\u1EBD k\u1EBFt th\xFAc cu\u1ED9c g\u1ECDi l\xFAc n\xE0y. C\u1EA3m \u01A1n b\u1EA1n \u0111\xE3 g\u1ECDi.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var vi_VN_default = viVN;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zh-CN/index.ts
  var zhCN = {
    abuseDetectedTransferMessage: "\u6211\u73B0\u5728\u4E3A\u60A8\u8F6C\u63A5\u5230\u4EBA\u5DE5\u5BA2\u670D\u3002",
    abuseDetectedTerminationMessage: "\u62B1\u6B49\uFF0C\u8FD9\u4E2A\u8BF7\u6C42\u6211\u65E0\u6CD5\u534F\u52A9\u3002",
    defaultVoicePersona: "xiaochen-liu",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u60A8\u597D\uFF0C\u611F\u8C22\u6765\u7535\u3002\u8BF7\u95EE\u4ECA\u5929\u6211\u53EF\u4EE5\u4E3A\u60A8\u63D0\u4F9B\u4EC0\u4E48\u5E2E\u52A9\uFF1F",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u7EC4\u7EC7",
    defaultAgentName: "\u667A\u80FD\u4F53",
    errorMessage: "\u6211\u9047\u5230\u4E86\u4E00\u4E9B\u6280\u672F\u95EE\u9898\u3002\u5F88\u62B1\u6B49\u7ED9\u60A8\u5E26\u6765\u4E0D\u4FBF\u3002",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\u60A8\u8FD8\u5728\u7EBF\u5417\uFF1F\u5982\u679C\u9700\u8981\uFF0C\u6211\u53EF\u4EE5\u7EE7\u7EED\u4E3A\u60A8\u670D\u52A1\u3002",
    inactivityHangupMessage: "\u76EE\u524D\u6CA1\u6709\u6536\u5230\u60A8\u7684\u56DE\u5E94\uFF0C\u6211\u5148\u7ED3\u675F\u901A\u8BDD\u3002\u611F\u8C22\u6765\u7535\u3002",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var zh_CN_default = zhCN;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zh-HK/index.ts
  var zhHK = {
    abuseDetectedTransferMessage: "\u6211\u800C\u5BB6\u70BA\u4F60\u8F49\u99C1\u53BB\u5BA2\u6236\u670D\u52D9\u5718\u968A\u3002",
    abuseDetectedTerminationMessage: "\u5514\u597D\u610F\u601D\uFF0C\u5462\u500B\u8981\u6C42\u6211\u5E6B\u5514\u5230\u4F60\u3002",
    defaultVoicePersona: "hiu-maan-chan",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "\u4F60\u597D\uFF0C\u591A\u8B1D\u4F60\u4F86\u96FB\u3002\u4ECA\u65E5\u6709\u54A9\u53EF\u4EE5\u5E6B\u5230\u4F60\uFF1F",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "\u6A5F\u69CB",
    defaultAgentName: "\u667A\u80FD\u9AD4",
    errorMessage: "\u6211\u9047\u5230\u6280\u8853\u554F\u984C\u3002\u5514\u597D\u610F\u601D\u5E36\u569F\u4E0D\u4FBF\u3002",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "\u4F60\u4EF2\u55BA\u5EA6\u55CE\uFF1F\u6211\u53EF\u4EE5\u7E7C\u7E8C\u5E6B\u4F60\u3002",
    inactivityHangupMessage: "\u6211\u66AB\u6642\u672A\u807D\u5230\u4F60\u5605\u56DE\u61C9\uFF0C\u800C\u5BB6\u5148\u7D50\u675F\u901A\u8A71\u3002\u591A\u8B1D\u4F60\u4F86\u96FB\u3002",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var zh_HK_default = zhHK;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zu-ZA/index.ts
  var zuZA = {
    abuseDetectedTransferMessage: "Ngiyakudlulisela ethimbeni elisiza amakhasimende manje.",
    abuseDetectedTerminationMessage: "Ngiyaxolisa, angikwazi ukuqhubeka nokusiza ngalokho.",
    defaultVoicePersona: "thando-khumalo",
    defaultVoiceKeywords: [],
    defaultVoiceSynthesisRewrites: [],
    defaultVoiceGreeting: "Sawubona, siyabonga ngokushayela. Ngingakusiza ngani namuhla?",
    uninterruptibleGreeting: false,
    defaultOrganizationName: "Inhlangano",
    defaultAgentName: "I-ejenti",
    errorMessage: "Kube nenkinga yobuchwepheshe. Ngiyaxolisa ngokuphazamiseka.",
    inactivityMode: "static",
    inactivityTimeoutSeconds: 30,
    inactivityMaxCount: 4,
    inactivityPromptMessage: "Usekhona lapho? Ngikhona ukuze ngikusize.",
    inactivityHangupMessage: "Kubukeka sengathi angisakuzwa, ngakho ngizovala ucingo okwamanje. Ngiyabonga.",
    adaptiveMinWaitSeconds: 15,
    adaptiveMaxWaitSeconds: 90,
    progressIndicatorMode: "personalized",
    progressIndicatorInitialDelayMs: 1400,
    progressIndicatorTrailingSilenceMs: 2e3,
    progressIndicatorChatEnabled: false,
    progressIndicatorAdditionalInstructions: void 0,
    personaConfigDefaultTraitIds: ["standard-customer-service", "base-channel-optimization"],
    responseGuidanceTraits: [
      {
        id: "standard-customer-service",
        label: "Standard customer service",
        description: "Friendly, empathetic baseline for customer service conversations.",
        personalityTraitIDs: ["standard-customer-service"],
        category: "base"
      },
      {
        id: "base-channel-optimization",
        personalityTraitIDs: [
          "voice-standard",
          "voice-modality-context",
          "voice-long-identifiers",
          "email-modality-context"
        ],
        label: "Optimize by channel",
        category: "base",
        description: "Adjust response format and pacing based on whether the customer is in voice, chat, or email."
      }
    ]
  };
  var zu_ZA_default = zuZA;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/types.ts
  function isLocaleDefaultsByVariant(value) {
    return typeof value === "object" && value !== null && "feminine" in value && "masculine" in value;
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/index.ts
  var SUPPORTED_LOCALE_DEFAULTS = {
    "ar-AE": ar_AE_default,
    "ar-EG": ar_EG_default,
    "ar-JO": ar_JO_default,
    "ar-KW": ar_KW_default,
    "ar-SA": ar_SA_default,
    "ca-ES": ca_ES_default,
    "cs-CZ": cs_CZ_default,
    "da-DK": da_DK_default,
    "de-DE": de_DE_default,
    "el-GR": el_GR_default,
    "en-AU": en_AU_default,
    "en-GB": en_GB_default,
    "en-IE": en_IE_default,
    "en-ID": en_ID_default,
    "en-JM": en_JM_default,
    "en-NZ": en_NZ_default,
    "en-PH": en_PH_default,
    "en-SG": en_SG_default,
    "en-US": en_US_default,
    "en-ZA": en_ZA_default,
    "es-AR": es_AR_default,
    "es-CO": es_CO_default,
    "es-ES": es_ES_default,
    "es-MX": es_MX_default,
    "eu-ES": eu_ES_default,
    "fi-FI": fi_FI_default,
    "fil-PH": fil_PH_default,
    "fr-CA": fr_CA_default,
    "fr-CH": fr_CH_default,
    "fr-FR": fr_FR_default,
    "fr-SN": fr_SN_default,
    "gl-ES": gl_ES_default,
    "he-IL": he_IL_default,
    "hi-IN": hi_IN_default,
    "hr-HR": hr_HR_default,
    "hu-HU": hu_HU_default,
    "id-ID": id_ID_default,
    "is-IS": is_IS_default,
    "it-IT": it_IT_default,
    "ja-JP": ja_JP_default,
    "ko-KR": ko_KR_default,
    "lt-LT": lt_LT_default,
    "ms-MY": ms_MY_default,
    "nb-NO": nb_NO_default,
    "nl-BE": nl_BE_default,
    "nl-NL": nl_NL_default,
    "pl-PL": pl_PL_default,
    "pt-BR": pt_BR_default,
    "pt-PT": pt_PT_default,
    "ro-RO": ro_RO_default,
    "ru-RU": ru_RU_default,
    "sk-SK": sk_SK_default,
    "sv-SE": sv_SE_default,
    "th-TH": th_TH_default,
    "tl-PH": tl_PH_default,
    "tr-TR": tr_TR_default,
    "uk-UA": uk_UA_default,
    "vi-VN": vi_VN_default,
    "zh-CN": zh_CN_default,
    "zh-HK": zh_HK_default,
    "zu-ZA": zu_ZA_default
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/common/synthesis-rewrites/gregorian-date.ts
  function isValidGregorianDate(year, month, day) {
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-AE/synthesis-rewrites/rules.ts
  var UAE_NUMERIC_DATE_REGEX = /\b(?:(\d{1,2}\/\d{1,2}\/(\d{4}|\d{2}))|(\d{1,2}-\d{1,2}-(\d{4}|\d{2})))\b/;
  var ARABIC_MONTH_NAMES = [
    "\u064A\u0646\u0627\u064A\u0631",
    "\u0641\u0628\u0631\u0627\u064A\u0631",
    "\u0645\u0627\u0631\u0633",
    "\u0623\u0628\u0631\u064A\u0644",
    "\u0645\u0627\u064A\u0648",
    "\u064A\u0648\u0646\u064A\u0648",
    "\u064A\u0648\u0644\u064A\u0648",
    "\u0623\u063A\u0633\u0637\u0633",
    "\u0633\u0628\u062A\u0645\u0628\u0631",
    "\u0623\u0643\u062A\u0648\u0628\u0631",
    "\u0646\u0648\u0641\u0645\u0628\u0631",
    "\u062F\u064A\u0633\u0645\u0628\u0631"
  ];
  var ARABIC_ORDINAL_DAYS = [
    "",
    "\u0627\u0644\u0623\u0648\u0644",
    "\u0627\u0644\u062B\u0627\u0646\u064A",
    "\u0627\u0644\u062B\u0627\u0644\u062B",
    "\u0627\u0644\u0631\u0627\u0628\u0639",
    "\u0627\u0644\u062E\u0627\u0645\u0633",
    "\u0627\u0644\u0633\u0627\u062F\u0633",
    "\u0627\u0644\u0633\u0627\u0628\u0639",
    "\u0627\u0644\u062B\u0627\u0645\u0646",
    "\u0627\u0644\u062A\u0627\u0633\u0639",
    "\u0627\u0644\u0639\u0627\u0634\u0631",
    "\u0627\u0644\u062D\u0627\u062F\u064A \u0639\u0634\u0631",
    "\u0627\u0644\u062B\u0627\u0646\u064A \u0639\u0634\u0631",
    "\u0627\u0644\u062B\u0627\u0644\u062B \u0639\u0634\u0631",
    "\u0627\u0644\u0631\u0627\u0628\u0639 \u0639\u0634\u0631",
    "\u0627\u0644\u062E\u0627\u0645\u0633 \u0639\u0634\u0631",
    "\u0627\u0644\u0633\u0627\u062F\u0633 \u0639\u0634\u0631",
    "\u0627\u0644\u0633\u0627\u0628\u0639 \u0639\u0634\u0631",
    "\u0627\u0644\u062B\u0627\u0645\u0646 \u0639\u0634\u0631",
    "\u0627\u0644\u062A\u0627\u0633\u0639 \u0639\u0634\u0631",
    "\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062D\u0627\u062F\u064A \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062B\u0627\u0646\u064A \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062B\u0627\u0644\u062B \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u0631\u0627\u0628\u0639 \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062E\u0627\u0645\u0633 \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u0633\u0627\u062F\u0633 \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u0633\u0627\u0628\u0639 \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062B\u0627\u0645\u0646 \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062A\u0627\u0633\u0639 \u0648\u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    "\u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0646",
    "\u0627\u0644\u062D\u0627\u062F\u064A \u0648\u0627\u0644\u062B\u0644\u0627\u062B\u064A\u0646"
  ];
  var ARABIC_ONES = [
    "",
    "\u0648\u0627\u062D\u062F",
    "\u0627\u062B\u0646\u0627\u0646",
    "\u062B\u0644\u0627\u062B\u0629",
    "\u0623\u0631\u0628\u0639\u0629",
    "\u062E\u0645\u0633\u0629",
    "\u0633\u062A\u0629",
    "\u0633\u0628\u0639\u0629",
    "\u062B\u0645\u0627\u0646\u064A\u0629",
    "\u062A\u0633\u0639\u0629"
  ];
  var ARABIC_TEENS = [
    "\u0639\u0634\u0631\u0629",
    "\u0623\u062D\u062F \u0639\u0634\u0631",
    "\u0627\u062B\u0646\u0627 \u0639\u0634\u0631",
    "\u062B\u0644\u0627\u062B\u0629 \u0639\u0634\u0631",
    "\u0623\u0631\u0628\u0639\u0629 \u0639\u0634\u0631",
    "\u062E\u0645\u0633\u0629 \u0639\u0634\u0631",
    "\u0633\u062A\u0629 \u0639\u0634\u0631",
    "\u0633\u0628\u0639\u0629 \u0639\u0634\u0631",
    "\u062B\u0645\u0627\u0646\u064A\u0629 \u0639\u0634\u0631",
    "\u062A\u0633\u0639\u0629 \u0639\u0634\u0631"
  ];
  var ARABIC_TENS = [
    "",
    "",
    "\u0639\u0634\u0631\u064A\u0646",
    "\u062B\u0644\u0627\u062B\u064A\u0646",
    "\u0623\u0631\u0628\u0639\u064A\u0646",
    "\u062E\u0645\u0633\u064A\u0646",
    "\u0633\u062A\u064A\u0646",
    "\u0633\u0628\u0639\u064A\u0646",
    "\u062B\u0645\u0627\u0646\u064A\u0646",
    "\u062A\u0633\u0639\u064A\u0646"
  ];
  function spellArabicNumberBelow100(value) {
    if (value <= 0 || value >= 100) {
      return null;
    }
    if (value < 10) {
      return ARABIC_ONES[value] || null;
    }
    if (value < 20) {
      return ARABIC_TEENS[value - 10] || null;
    }
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    if (ones === 0) {
      return ARABIC_TENS[tens] || null;
    }
    return `${ARABIC_ONES[ones]} \u0648${ARABIC_TENS[tens]}`;
  }
  function spellArabicYear(year) {
    if (year === 2e3) {
      return "\u0623\u0644\u0641\u064A\u0646";
    }
    if (year > 2e3 && year < 2100) {
      const suffix = spellArabicNumberBelow100(year - 2e3);
      return suffix ? `\u0623\u0644\u0641\u064A\u0646 \u0648${suffix}` : null;
    }
    if (year === 1900) {
      return "\u0623\u0644\u0641 \u0648\u062A\u0633\u0639\u0645\u0627\u0626\u0629";
    }
    if (year > 1900 && year < 2e3) {
      const suffix = spellArabicNumberBelow100(year - 1900);
      return suffix ? `\u0623\u0644\u0641 \u0648\u062A\u0633\u0639\u0645\u0627\u0626\u0629 \u0648${suffix}` : null;
    }
    return null;
  }
  function rewriteArabicDateForSynthesis(text) {
    const separator = text.includes("/") ? "/" : text.includes("-") ? "-" : null;
    if (!separator) {
      return text;
    }
    const [firstPart, secondPart, yearPart] = text.split(separator);
    const firstValue = Number.parseInt(firstPart, 10);
    const secondValue = Number.parseInt(secondPart, 10);
    const rawYear = Number.parseInt(yearPart, 10);
    if (Number.isNaN(firstValue) || Number.isNaN(secondValue) || Number.isNaN(rawYear)) {
      return text;
    }
    const year = yearPart.length === 2 ? 2e3 + rawYear : rawYear;
    const dayMonthYear = isValidGregorianDate(year, secondValue, firstValue) ? { day: firstValue, month: secondValue } : isValidGregorianDate(year, firstValue, secondValue) ? { day: secondValue, month: firstValue } : null;
    if (!dayMonthYear) {
      return text;
    }
    const spokenDay = ARABIC_ORDINAL_DAYS[dayMonthYear.day];
    const spokenMonth = ARABIC_MONTH_NAMES[dayMonthYear.month - 1];
    const spokenYear = spellArabicYear(year);
    if (!spokenYear) {
      return text;
    }
    return `${spokenDay} \u0645\u0646 ${spokenMonth} \u0639\u0627\u0645 ${spokenYear}`;
  }
  var AR_AE_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      label: "Date normalization",
      description: "Converts numeric dates into fully spoken Arabic, assuming UAE standard formatting of DD/MM/YYYY. Falls back to MM/DD/YYYY if only valid option.",
      playgroundSample: "\u0633\u064A\u064F\u0639\u0642\u062F \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639 \u0641\u064A 04/02/2026 \u0641\u064A \u0645\u0642\u0631 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u062F\u0628\u064A.",
      pattern: UAE_NUMERIC_DATE_REGEX,
      replacement: rewriteArabicDateForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/synthesis-rewrites.ts
  function defineLocaleSynthesisRewriteRules(definitions) {
    const seen = /* @__PURE__ */ new Set();
    return definitions.map(({ id, rule, expectedLabel }) => {
      if (seen.has(id)) {
        throw new Error(`Duplicate synthesis rewrite rule ID "${id}"`);
      }
      seen.add(id);
      if (rule.id && rule.id !== id) {
        throw new Error(
          `Synthesis rewrite rule "${expectedLabel ?? id}" has id "${rule.id}", expected "${id}"`
        );
      }
      if (expectedLabel && rule.label !== expectedLabel) {
        throw new Error(
          `Synthesis rewrite rule "${id}" has label "${rule.label ?? ""}", expected "${expectedLabel}"`
        );
      }
      return { ...rule, id };
    });
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/ar-AE/synthesis-rewrites/index.ts
  var AR_AE_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "ar-ae:date-normalization",
      rule: AR_AE_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Date normalization"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/de-DE/synthesis-rewrites/rules.ts
  var DE_DIGIT_WORDS = [
    "null",
    "eins",
    "zwei",
    "drei",
    "vier",
    "f\xFCnf",
    "sechs",
    "sieben",
    "acht",
    "neun"
  ];
  var DE_ONES_COMBINING = [
    "",
    "ein",
    "zwei",
    "drei",
    "vier",
    "f\xFCnf",
    "sechs",
    "sieben",
    "acht",
    "neun"
  ];
  var DE_TEENS = [
    "zehn",
    "elf",
    "zw\xF6lf",
    "dreizehn",
    "vierzehn",
    "f\xFCnfzehn",
    "sechzehn",
    "siebzehn",
    "achtzehn",
    "neunzehn"
  ];
  var DE_TENS = [
    "",
    "",
    "zwanzig",
    "drei\xDFig",
    "vierzig",
    "f\xFCnfzig",
    "sechzig",
    "siebzig",
    "achtzig",
    "neunzig"
  ];
  function spellUnder100(n) {
    if (n < 1 || n > 99) {
      return null;
    }
    if (n < 10) {
      return DE_DIGIT_WORDS[n];
    }
    if (n < 20) {
      return DE_TEENS[n - 10];
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) {
      return DE_TENS[tens];
    }
    return `${DE_ONES_COMBINING[ones]}und${DE_TENS[tens]}`;
  }
  function spellUnder1000(n) {
    if (n < 1 || n > 999) {
      return null;
    }
    if (n < 100) {
      return spellUnder100(n);
    }
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredsPart = `${DE_ONES_COMBINING[hundreds]}hundert`;
    if (remainder === 0) {
      return hundredsPart;
    }
    const remainderPart = spellUnder100(remainder);
    return remainderPart ? `${hundredsPart}${remainderPart}` : null;
  }
  function spellGermanWholeNumber(n) {
    if (n < 0 || n > 999999) {
      return null;
    }
    if (n === 0) {
      return "null";
    }
    if (n < 1e3) {
      return spellUnder1000(n);
    }
    const thousands = Math.floor(n / 1e3);
    const remainder = n % 1e3;
    const prefix = thousands === 1 ? "ein" : spellUnder1000(thousands);
    if (!prefix) {
      return null;
    }
    const result = `${prefix}tausend`;
    if (remainder === 0) {
      return result;
    }
    const remainderPart = spellUnder1000(remainder);
    return remainderPart ? `${result}${remainderPart}` : null;
  }
  var DE_DATE_REGEX = /\b(?:(?:am|vom|zum|ab|bis|seit)\s+)?\d{1,2}\.\d{1,2}\.(?:\d{4}|\d{2})\b/i;
  var TWENTY_FIRST_CENTURY_THRESHOLD = 30;
  var DE_MONTH_NAMES = [
    "Januar",
    "Februar",
    "M\xE4rz",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember"
  ];
  var DE_ORDINAL_DAYS = [
    "",
    "erste",
    "zweite",
    "dritte",
    "vierte",
    "f\xFCnfte",
    "sechste",
    "siebte",
    "achte",
    "neunte",
    "zehnte",
    "elfte",
    "zw\xF6lfte",
    "dreizehnte",
    "vierzehnte",
    "f\xFCnfzehnte",
    "sechzehnte",
    "siebzehnte",
    "achtzehnte",
    "neunzehnte",
    "zwanzigste",
    "einundzwanzigste",
    "zweiundzwanzigste",
    "dreiundzwanzigste",
    "vierundzwanzigste",
    "f\xFCnfundzwanzigste",
    "sechsundzwanzigste",
    "siebenundzwanzigste",
    "achtundzwanzigste",
    "neunundzwanzigste",
    "drei\xDFigste",
    "einunddrei\xDFigste"
  ];
  var DE_DATE_PREPOSITION_REPLACEMENTS = {
    am: (day) => `am ${day}`,
    vom: (day) => `vom ${day}`,
    zum: (day) => `zum ${day}`,
    ab: (day) => `ab dem ${day}`,
    bis: (day) => `bis zum ${day}`,
    seit: (day) => `seit dem ${day}`
  };
  function dativeOrdinal(nominativeOrdinal) {
    return `${nominativeOrdinal}n`;
  }
  function preserveInitialCapitalization(source, replacement) {
    if (source[0] !== source[0].toUpperCase()) {
      return replacement;
    }
    return `${replacement[0].toUpperCase()}${replacement.slice(1)}`;
  }
  function spellGermanYear(year) {
    if (year >= 2e3 && year <= 2099) {
      const remainder = year - 2e3;
      if (remainder === 0) {
        return "zweitausend";
      }
      const remainderPart = spellUnder1000(remainder);
      return remainderPart ? `zweitausend${remainderPart}` : null;
    }
    if (year >= 1e3 && year <= 1999) {
      const hundreds = Math.floor(year / 100);
      const remainder = year % 100;
      const hundredsWord = spellUnder100(hundreds);
      if (!hundredsWord) {
        return null;
      }
      const base = `${hundredsWord}hundert`;
      if (remainder === 0) {
        return base;
      }
      const remainderPart = spellUnder100(remainder);
      return remainderPart ? `${base}${remainderPart}` : null;
    }
    return null;
  }
  function rewriteDeDateForSynthesis(text) {
    const trimmed = text.trim();
    const match = /^(?:(?<preposition>am|vom|zum|ab|bis|seit)\s+)?(?<date>\d{1,2}\.\d{1,2}\.(?:\d{4}|\d{2}))$/i.exec(
      trimmed
    );
    const dateText = match?.groups?.["date"] ?? trimmed;
    const parts = dateText.split(".");
    if (parts.length !== 3) {
      return text;
    }
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const rawYear = Number.parseInt(parts[2], 10);
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(rawYear)) {
      return text;
    }
    const year = parts[2].length === 2 ? rawYear < TWENTY_FIRST_CENTURY_THRESHOLD ? 2e3 + rawYear : 1900 + rawYear : rawYear;
    if (!isValidGregorianDate(year, month, day)) {
      return text;
    }
    const nominativeOrdinal = DE_ORDINAL_DAYS[day];
    const monthName = DE_MONTH_NAMES[month - 1];
    const spokenYear = spellGermanYear(year);
    if (!nominativeOrdinal || !monthName || !spokenYear) {
      return text;
    }
    const rawPreposition = match?.groups?.["preposition"];
    const preposition = rawPreposition?.toLowerCase();
    if (rawPreposition && preposition) {
      const replacement = DE_DATE_PREPOSITION_REPLACEMENTS[preposition];
      const phrase = replacement(dativeOrdinal(nominativeOrdinal));
      return `${preserveInitialCapitalization(rawPreposition, phrase)} ${monthName} ${spokenYear}`;
    }
    return `der ${nominativeOrdinal} ${monthName} ${spokenYear}`;
  }
  var DE_PHONE_REGEX = /(?<!\d)(?:\+49|0)(?:[ /-]?\d){5,12}(?!\d)/;
  function spellDigit(ch) {
    const n = Number.parseInt(ch, 10);
    return Number.isNaN(n) ? ch : DE_DIGIT_WORDS[n];
  }
  function spellDigitGroup(group) {
    return [...group].map(spellDigit).join(" ");
  }
  function spellPhoneTailGroup(group) {
    const pairs = [];
    for (let i = 0; i < group.length; i += 2) {
      pairs.push(spellDigitGroup(group.slice(i, i + 2)));
    }
    return pairs.join(", ");
  }
  function rewriteDePhoneForSynthesis(text) {
    const normalized = text.replace(/[ /-]/g, "");
    let digits;
    let prefixSpoken;
    let explicitGroups;
    if (normalized.startsWith("+49")) {
      prefixSpoken = "plus vier neun";
      digits = normalized.slice(3);
      explicitGroups = text.replace(/^\+49/, "").match(/\d+/g) ?? [];
    } else if (normalized.startsWith("0")) {
      prefixSpoken = null;
      digits = normalized;
      explicitGroups = text.match(/\d+/g) ?? [];
    } else {
      return text;
    }
    if (/\D/.test(digits) || digits.length === 0) {
      return text;
    }
    const groups = explicitGroups.length > 1 ? explicitGroups.map(
      (group, index) => index === 0 ? spellDigitGroup(group) : spellPhoneTailGroup(group)
    ) : [spellPhoneTailGroup(digits)];
    const spoken = groups.join(", ");
    return prefixSpoken ? `${prefixSpoken}, ${spoken}` : spoken;
  }
  var DE_CURRENCY_REGEX = /(?:-\s?)?(?:(?:€|EUR)\s?\d{1,3}(?:(?:\.\d{3})+|\d*)(?:,\d{1,2})?|\d{1,3}(?:(?:\.\d{3})+|\d*)(?:,\d{1,2})?\s?(?:€|EUR))/i;
  function rewriteDeCurrencyForSynthesis(text) {
    let body = text.trim();
    const negative = body.startsWith("-");
    if (negative) {
      body = body.slice(1).trimStart();
    }
    body = body.replace(/€|EUR/gi, "").replace(/\s/g, "");
    if (!body) {
      return text;
    }
    const [wholePart, fractionPart = ""] = body.split(",");
    const whole = Number.parseInt(wholePart.replace(/\./g, ""), 10);
    if (Number.isNaN(whole)) {
      return text;
    }
    let fraction = 0;
    if (fractionPart) {
      const padded = fractionPart.length === 1 ? `${fractionPart}0` : fractionPart;
      fraction = Number.parseInt(padded, 10);
      if (Number.isNaN(fraction)) {
        return text;
      }
    }
    const parts = [];
    if (whole > 0) {
      const spokenWhole = whole === 1 ? "ein" : spellGermanWholeNumber(whole);
      if (!spokenWhole) {
        return text;
      }
      parts.push(`${spokenWhole} Euro`);
    }
    if (fraction > 0) {
      const spokenFraction = fraction === 1 ? "ein" : spellGermanWholeNumber(fraction);
      if (!spokenFraction) {
        return text;
      }
      parts.push(`${spokenFraction} Cent`);
    }
    if (parts.length === 0) {
      parts.push("null Euro");
    }
    return `${negative ? "minus " : ""}${parts.join(" und ")}`;
  }
  var DE_LONG_DIGIT_REGEX = /(?<![+\d])(?<!\+\d\d\s)(?<!\)\s)\d(?:[ -]?\d){6,}(?!\d)/;
  var DE_LONG_DIGIT_MIN_LENGTH = 7;
  function rewriteDeLongDigitsForSynthesis(text) {
    const digits = text.replace(/[ -]/g, "");
    if (digits.length < DE_LONG_DIGIT_MIN_LENGTH || /\D/.test(digits)) {
      return text;
    }
    if (digits.startsWith("00") && digits.length >= 12) {
      return text;
    }
    const pairs = [];
    for (let i = 0; i < digits.length; i += 2) {
      pairs.push(spellDigitGroup(digits.slice(i, i + 2)));
    }
    return pairs.join(", ");
  }
  var DE_DE_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      id: "system:date",
      label: "Dates",
      description: "Converts dates in dd.mm.yyyy format to fully spoken German.",
      playgroundSample: "Ihr Vertrag beginnt am 24.06.2021.",
      pattern: DE_DATE_REGEX,
      replacement: rewriteDeDateForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads German phone numbers (030 12345678 or +49 \u2026 form) in two-digit groups using 'null' for zero.",
      playgroundSample: "Sie erreichen uns unter 030 12345678.",
      pattern: DE_PHONE_REGEX,
      replacement: rewriteDePhoneForSynthesis
    },
    {
      id: "system:price",
      label: "Currency",
      description: "Converts euro amounts (\u20AC, EUR) to fully spoken German.",
      playgroundSample: "Ihr Saldo betr\xE4gt 1.234,56 \u20AC.",
      pattern: DE_CURRENCY_REGEX,
      replacement: rewriteDeCurrencyForSynthesis
    },
    {
      label: "Long digit sequences",
      description: "Spells digit sequences of 7 or more characters in two-digit groups (e.g. account numbers, references, IBANs).",
      playgroundSample: "Ihre Vorgangsnummer lautet 12345678.",
      pattern: DE_LONG_DIGIT_REGEX,
      replacement: rewriteDeLongDigitsForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/de-DE/synthesis-rewrites/index.ts
  var DE_DE_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: DE_DE_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "de-de:phone-numbers",
      rule: DE_DE_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Phone numbers"
    },
    {
      id: "system:price",
      rule: DE_DE_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Currency"
    },
    {
      id: "de-de:long-digit-sequences",
      rule: DE_DE_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Long digit sequences"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/common/synthesis-rewrites/english-day-first-date.ts
  var NUMERIC_DATE_REGEX = /\b(?:(\d{1,2}\/\d{1,2}\/(\d{4}|\d{2}))|(\d{1,2}-\d{1,2}-(\d{4}|\d{2})))\b/;
  var MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var ORDINAL_DAYS = [
    "",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
    "twentieth",
    "twenty-first",
    "twenty-second",
    "twenty-third",
    "twenty-fourth",
    "twenty-fifth",
    "twenty-sixth",
    "twenty-seventh",
    "twenty-eighth",
    "twenty-ninth",
    "thirtieth",
    "thirty-first"
  ];
  var ONES = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  var TENS = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
  ];
  var TWENTY_FIRST_CENTURY_THRESHOLD2 = 30;
  function spellNumberUnder100(n) {
    if (n < 0 || n > 99) {
      return null;
    }
    if (n < 20) {
      return ONES[n] || null;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) {
      return TENS[tens] || null;
    }
    return `${TENS[tens]}-${ONES[ones]}`;
  }
  function spellYear(year) {
    if (year < 1900 || year > 2099) {
      return null;
    }
    if (year === 2e3) {
      return "two thousand";
    }
    const centuryPair = Math.floor(year / 100);
    const yearPair = year % 100;
    const centuryWord = spellNumberUnder100(centuryPair);
    if (!centuryWord) {
      return null;
    }
    if (yearPair === 0) {
      return `${centuryWord} hundred`;
    }
    if (yearPair < 10) {
      return `${centuryWord} oh ${ONES[yearPair]}`;
    }
    const yearPairWord = spellNumberUnder100(yearPair);
    if (!yearPairWord) {
      return null;
    }
    return `${centuryWord} ${yearPairWord}`;
  }
  function rewriteDate(text) {
    const separator = text.includes("/") ? "/" : "-";
    const parts = text.split(separator);
    if (parts.length !== 3) {
      return text;
    }
    const dayValue = Number.parseInt(parts[0], 10);
    const monthValue = Number.parseInt(parts[1], 10);
    const rawYear = Number.parseInt(parts[2], 10);
    if (Number.isNaN(dayValue) || Number.isNaN(monthValue) || Number.isNaN(rawYear)) {
      return text;
    }
    const year = parts[2].length === 2 ? rawYear < TWENTY_FIRST_CENTURY_THRESHOLD2 ? 2e3 + rawYear : 1900 + rawYear : rawYear;
    if (!isValidGregorianDate(year, monthValue, dayValue)) {
      return text;
    }
    const ordinalDay = ORDINAL_DAYS[dayValue];
    const monthName = MONTH_NAMES[monthValue - 1];
    const spokenYear = spellYear(year);
    if (!ordinalDay || !monthName || !spokenYear) {
      return text;
    }
    return `the ${ordinalDay} of ${monthName}, ${spokenYear}`;
  }
  var ENGLISH_DAY_FIRST_DATE_REWRITE = {
    id: "system:date",
    label: "Dates",
    description: "Converts DD/MM/YYYY dates into spoken English (day-first locales).",
    playgroundSample: "Your policy was issued on 24/06/2021.",
    pattern: NUMERIC_DATE_REGEX,
    replacement: rewriteDate
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/synthesis-rewrites/addresses.ts
  var AU_STATE_SPOKEN_NAMES = {
    NSW: "New South Wales",
    ACT: "A-C-T",
    QLD: "Queensland",
    VIC: "Victoria",
    TAS: "Tasmania",
    SA: "South Australia",
    WA: "Western Australia",
    NT: "Northern Territory"
  };
  var STATE_POSTCODE_REGEX = /\b(?:NSW|ACT|QLD|VIC|TAS|SA|WA|NT)\s+\d{4}\b/i;
  var LABELLED_POSTCODE_REGEX = /\b(?:post ?code|postal code)(?:\s+is)?\s*:?\s*\d{4}\b/i;
  var STATE_ABBREVIATION_REGEX = /\b(?:in|to|from|for|near|within|across|around|into|through|throughout|via|at)\s+(?:the\s+)?(?:NSW|ACT|QLD|VIC|TAS|SA|WA|NT)\b/;
  var STATE_ABBREVIATION_SUFFIX_REGEX = /\b(?:NSW|ACT|QLD|VIC|TAS|SA|WA|NT)\b$/;
  var POSTCODE_DIGIT_WORDS = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine"
  ];
  function spellPostcode(postcode) {
    return [...postcode].map((ch) => POSTCODE_DIGIT_WORDS[Number.parseInt(ch, 10)]).join(" ");
  }
  function spokenStateName(state) {
    return AU_STATE_SPOKEN_NAMES[state.toUpperCase()];
  }
  function rewriteStatePostcodeForSynthesis(text) {
    const [state, postcode] = text.trim().split(/\s+/);
    const spokenState = state ? spokenStateName(state) : void 0;
    if (!spokenState || !postcode || !/^\d{4}$/.test(postcode)) {
      return text;
    }
    return `${spokenState}, ${spellPostcode(postcode)}`;
  }
  function rewriteLabelledPostcodeForSynthesis(text) {
    const trimmed = text.trim();
    const postcode = trimmed.slice(-4);
    if (!/^\d{4}$/.test(postcode)) {
      return text;
    }
    return `${text.slice(0, text.length - 4)}${spellPostcode(postcode)}`;
  }
  function rewriteStateAbbreviationForSynthesis(text) {
    return text.replace(STATE_ABBREVIATION_SUFFIX_REGEX, (state) => spokenStateName(state) ?? state);
  }
  var EN_AU_STATE_POSTCODE_REWRITE = {
    label: "State/postcode pairs",
    description: "Reads Australian address state abbreviations as state names and 4-digit postcodes digit by digit.",
    playgroundSample: "Send it to Sydney NSW 2000.",
    pattern: STATE_POSTCODE_REGEX,
    replacement: rewriteStatePostcodeForSynthesis
  };
  var EN_AU_LABELLED_POSTCODE_REWRITE = {
    label: "Postcodes",
    description: "Reads labelled Australian 4-digit postcodes digit by digit so they are not spoken as years or quantities.",
    playgroundSample: "The postcode is 3000.",
    pattern: LABELLED_POSTCODE_REGEX,
    replacement: rewriteLabelledPostcodeForSynthesis
  };
  var EN_AU_STATE_ABBREVIATION_REWRITE = {
    label: "State and territory abbreviations",
    description: "Reads contextual Australian state and territory abbreviations as names, with ACT kept as A-C-T.",
    playgroundSample: "Our office is in QLD.",
    pattern: STATE_ABBREVIATION_REGEX,
    replacement: rewriteStateAbbreviationForSynthesis
  };
  var EN_AU_ADDRESS_REWRITES = [
    EN_AU_STATE_POSTCODE_REWRITE,
    EN_AU_LABELLED_POSTCODE_REWRITE,
    EN_AU_STATE_ABBREVIATION_REWRITE
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/synthesis-rewrites/acronyms.ts
  var ACRONYM_LETTERS = [
    // Regulators
    "ATO",
    "ASIC",
    "APRA",
    "ACMA",
    "ACCC",
    "AUSTRAC",
    // Financial identifiers and taxes
    "TFN",
    "ABN",
    "ACN",
    "BSB",
    "GST",
    // Government services and finance
    "NDIS",
    "HECS",
    "RBA"
  ];
  function spellLetters(value) {
    return value.split("").join(" ");
  }
  var EN_AU_ACRONYM_REWRITES = ACRONYM_LETTERS.map(
    (acronym) => ({
      label: `Acronym: ${acronym}`,
      description: `Spells out the Australian initialism "${acronym}" letter by letter.`,
      playgroundSample: `Your ${acronym} reference is on file.`,
      pattern: new RegExp(`\\b${acronym}\\b`, "g"),
      replacement: spellLetters(acronym)
    })
  );

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/synthesis-rewrites/numbers.ts
  var ONES2 = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  var TENS2 = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
  ];
  function spellNumberUnder1002(n) {
    if (n < 0 || n > 99) {
      return null;
    }
    if (n < 20) {
      return ONES2[n] || null;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) {
      return TENS2[tens] || null;
    }
    return `${TENS2[tens]}-${ONES2[ones]}`;
  }
  function spellWholeNumber(n) {
    if (n === 0) {
      return "zero";
    }
    if (n < 0 || n >= 1e9) {
      return null;
    }
    if (n < 100) {
      return spellNumberUnder1002(n);
    }
    if (n < 1e3) {
      const hundreds = Math.floor(n / 100);
      const remainder2 = n % 100;
      const hundredWord = ONES2[hundreds];
      if (!hundredWord) {
        return null;
      }
      const hundredsPart = `${hundredWord} hundred`;
      if (remainder2 === 0) {
        return hundredsPart;
      }
      const remainderPart2 = spellNumberUnder1002(remainder2);
      if (!remainderPart2) {
        return null;
      }
      return `${hundredsPart} and ${remainderPart2}`;
    }
    if (n < 1e6) {
      const thousands = Math.floor(n / 1e3);
      const remainder2 = n % 1e3;
      const thousandsPart = `${spellWholeNumber(thousands)} thousand`;
      if (remainder2 === 0) {
        return thousandsPart;
      }
      const remainderPart2 = spellWholeNumber(remainder2);
      if (!remainderPart2) {
        return null;
      }
      return `${thousandsPart}${remainder2 < 100 ? " and " : ", "}${remainderPart2}`;
    }
    const millions = Math.floor(n / 1e6);
    const remainder = n % 1e6;
    const millionsPart = `${spellWholeNumber(millions)} million`;
    if (remainder === 0) {
      return millionsPart;
    }
    const remainderPart = spellWholeNumber(remainder);
    if (!remainderPart) {
      return null;
    }
    return `${millionsPart}${remainder < 100 ? " and " : ", "}${remainderPart}`;
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/synthesis-rewrites/currency.ts
  var AMOUNT_PATTERN = String.raw`\d{1,3}(?:(?:,\d{3})+|\d*)(?:\.\d{2})?`;
  var COMMON_NON_AUD_CURRENCY_CODES = [
    "CAD",
    "CNY",
    "EUR",
    "GBP",
    "HKD",
    "JPY",
    "NZD",
    "SGD",
    "USD"
  ];
  function caseInsensitiveCodePattern(code) {
    return [...code].map((char) => `[${char}${char.toLowerCase()}]`).join("");
  }
  var AUD_CODE_PATTERN = caseInsensitiveCodePattern("AUD");
  var COMMON_NON_AUD_CURRENCY_CODE_PATTERN = COMMON_NON_AUD_CURRENCY_CODES.map(
    caseInsensitiveCodePattern
  ).join("|");
  var NON_AUD_PREFIX_GUARD = String.raw`(?<![A-Z]{3}\s)(?<!(?:${COMMON_NON_AUD_CURRENCY_CODE_PATTERN})\s)`;
  var NON_AUD_SUFFIX_GUARD = String.raw`(?!\s?(?!${AUD_CODE_PATTERN}\b)(?:[A-Z]{3}|${COMMON_NON_AUD_CURRENCY_CODE_PATTERN})\b)`;
  var CURRENCY_REGEX = new RegExp(
    String.raw`(?<![\p{L}\d])${NON_AUD_PREFIX_GUARD}-?(?:${AUD_CODE_PATTERN}\s?\$?${AMOUNT_PATTERN}|\$${AMOUNT_PATTERN}\s?${AUD_CODE_PATTERN}|(?:A\$|AU\$|\$)${AMOUNT_PATTERN}${NON_AUD_SUFFIX_GUARD})(?![\p{L}\d])`,
    "u"
  );
  function unitName(singular, amount) {
    return amount === 1 ? singular : `${singular}s`;
  }
  function rewriteCurrencyForSynthesis(text) {
    let remaining = text.trim();
    const negative = remaining.startsWith("-");
    if (negative) {
      remaining = remaining.slice(1);
    }
    const hasExplicitAudMarker = /^(?:AUD\b|A\$|AU\$)/i.test(remaining) || /\bAUD$/i.test(remaining);
    remaining = remaining.replace(/^AUD\s?/i, "");
    remaining = remaining.replace(/\s?AUD$/i, "");
    remaining = remaining.replace(/^(?:A\$|AU\$|\$)/i, "");
    if (!/^\d/.test(remaining)) {
      return text;
    }
    const dotIndex = remaining.indexOf(".");
    const wholePart = dotIndex === -1 ? remaining : remaining.slice(0, dotIndex);
    const whole = Number.parseInt(wholePart.replace(/,/g, ""), 10);
    const fraction = dotIndex === -1 ? 0 : Number.parseInt(remaining.slice(dotIndex + 1), 10);
    if (Number.isNaN(whole) || Number.isNaN(fraction)) {
      return text;
    }
    const parts = [];
    if (whole > 0) {
      const spokenWhole = spellWholeNumber(whole);
      if (!spokenWhole) {
        return text;
      }
      const dollarUnit = hasExplicitAudMarker ? "Australian dollar" : "dollar";
      parts.push(`${spokenWhole} ${unitName(dollarUnit, whole)}`);
    }
    if (fraction > 0) {
      const spokenFraction = spellNumberUnder1002(fraction);
      if (!spokenFraction) {
        return text;
      }
      const centUnit = hasExplicitAudMarker && whole === 0 ? "Australian cent" : "cent";
      parts.push(`${spokenFraction} ${unitName(centUnit, fraction)}`);
    }
    if (parts.length === 0) {
      parts.push(`zero ${hasExplicitAudMarker ? "Australian dollars" : "dollars"}`);
    }
    return `${negative ? "minus " : ""}${parts.join(" and ")}`;
  }
  var EN_AU_CURRENCY_REWRITE = {
    id: "system:price",
    label: "Currency",
    description: "Converts AUD dollar amounts ($, A$, AU$, AUD) into fully spoken Australian English.",
    playgroundSample: "Your premium is $1,234.56, or AUD 1,234.56.",
    pattern: CURRENCY_REGEX,
    replacement: rewriteCurrencyForSynthesis
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/synthesis-rewrites/phones.ts
  var EMERGENCY_SERVICE_REGEX = /(?<![A-Za-z\d,.])000(?![A-Za-z,\d]|\.\d|[ -]\d)/;
  var THIRTEEN_HUNDRED_SERVICE_REGEX = /(?<!\d)1300(?:(?:[ -]?\d){6})?(?![ -]?\d)/;
  var EIGHTEEN_HUNDRED_SERVICE_REGEX = /(?<!\d)1800(?:(?:[ -]?\d){6})?(?![ -]?\d)/;
  var SIX_DIGIT_SERVICE_REGEX = /(?<!\d)13[ -]\d{2}[ -]\d{2}(?![ -]?\d)/;
  var MOBILE_REGEX = /(?<!\d)(?:04(?:[ -]?\d){8}|\+61[ -]?4(?:[ -]?\d){8})(?![ -]?\d)/;
  var LANDLINE_REGEX = /(?<!\d)(?:0[2378]|\(0[2378]\)|\+61[ -]?[2378])(?:[ -]?\d){8}(?![ -]?\d)/;
  var DIGIT_WORDS = [
    "oh",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine"
  ];
  var AU_INTERNATIONAL_PREFIX_WORDS = "plus six one";
  function spellDigit2(ch) {
    const n = Number.parseInt(ch, 10);
    return Number.isNaN(n) ? ch : DIGIT_WORDS[n];
  }
  function spellGroup(group) {
    return [...group].map(spellDigit2).join(" ");
  }
  function normalizePhoneNumber(text) {
    return text.replace(/[ ()-]/g, "");
  }
  function spellTwoDigitServiceGroup(group) {
    if (group.length !== 2 || /\D/.test(group)) {
      return group;
    }
    if (group.startsWith("0")) {
      return spellGroup(group);
    }
    return spellNumberUnder1002(Number.parseInt(group, 10)) ?? spellGroup(group);
  }
  function rewriteEmergencyServiceForSynthesis(text) {
    return text === "000" ? "triple zero" : text;
  }
  function rewriteFourDigitServiceForSynthesis(text, prefixWords) {
    const digits = normalizePhoneNumber(text);
    if (digits.length === 4) {
      return digits === "1300" || digits === "1800" ? prefixWords : text;
    }
    if (digits.length !== 10 || /\D/.test(digits)) {
      return text;
    }
    return [prefixWords, spellGroup(digits.slice(4, 7)), spellGroup(digits.slice(7, 10))].join(
      ", "
    );
  }
  function rewriteThirteenHundredServiceForSynthesis(text) {
    return rewriteFourDigitServiceForSynthesis(text, "thirteen hundred");
  }
  function rewriteEighteenHundredServiceForSynthesis(text) {
    return rewriteFourDigitServiceForSynthesis(text, "eighteen hundred");
  }
  function rewriteSixDigitServiceForSynthesis(text) {
    const digits = normalizePhoneNumber(text);
    if (digits.length !== 6 || !digits.startsWith("13") || /\D/.test(digits)) {
      return text;
    }
    return [
      "thirteen",
      spellTwoDigitServiceGroup(digits.slice(2, 4)),
      spellTwoDigitServiceGroup(digits.slice(4, 6))
    ].join(", ");
  }
  function rewriteMobileForSynthesis(text) {
    const normalized = normalizePhoneNumber(text);
    if (normalized.startsWith("+61")) {
      const digits = normalized.slice(3);
      if (digits.length !== 9 || !digits.startsWith("4") || /\D/.test(digits)) {
        return text;
      }
      return [
        AU_INTERNATIONAL_PREFIX_WORDS,
        spellGroup(digits.slice(0, 3)),
        spellGroup(digits.slice(3, 6)),
        spellGroup(digits.slice(6, 9))
      ].join(", ");
    }
    if (normalized.length !== 10 || !normalized.startsWith("04") || /\D/.test(normalized)) {
      return text;
    }
    return [
      spellGroup(normalized.slice(0, 4)),
      spellGroup(normalized.slice(4, 7)),
      spellGroup(normalized.slice(7, 10))
    ].join(", ");
  }
  function rewriteLandlineForSynthesis(text) {
    const normalized = normalizePhoneNumber(text);
    if (normalized.startsWith("+61")) {
      const digits = normalized.slice(3);
      if (digits.length !== 9 || !/^[2378]\d{8}$/.test(digits)) {
        return text;
      }
      return [
        AU_INTERNATIONAL_PREFIX_WORDS,
        spellGroup(digits.slice(0, 1)),
        spellGroup(digits.slice(1, 5)),
        spellGroup(digits.slice(5, 9))
      ].join(", ");
    }
    if (normalized.length !== 10 || !/^0[2378]\d{8}$/.test(normalized)) {
      return text;
    }
    return [
      spellGroup(normalized.slice(0, 2)),
      spellGroup(normalized.slice(2, 6)),
      spellGroup(normalized.slice(6, 10))
    ].join(", ");
  }
  var EN_AU_EMERGENCY_SERVICE_REWRITE = {
    label: "Emergency service number",
    description: 'Reads the Australian emergency number 000 as "triple zero".',
    playgroundSample: "In an emergency, call 000.",
    pattern: EMERGENCY_SERVICE_REGEX,
    replacement: rewriteEmergencyServiceForSynthesis
  };
  var EN_AU_THIRTEEN_HUNDRED_SERVICE_REWRITE = {
    label: "1300 service numbers",
    description: 'Reads Australian 1300 service numbers with the "thirteen hundred" prefix followed by digit groups.',
    playgroundSample: "Call 1300 123 456 for support.",
    pattern: THIRTEEN_HUNDRED_SERVICE_REGEX,
    replacement: rewriteThirteenHundredServiceForSynthesis
  };
  var EN_AU_EIGHTEEN_HUNDRED_SERVICE_REWRITE = {
    label: "1800 service numbers",
    description: 'Reads Australian 1800 service numbers with the "eighteen hundred" prefix followed by digit groups.',
    playgroundSample: "Call 1800 123 456 for support.",
    pattern: EIGHTEEN_HUNDRED_SERVICE_REGEX,
    replacement: rewriteEighteenHundredServiceForSynthesis
  };
  var EN_AU_SIX_DIGIT_SERVICE_REWRITE = {
    label: "13 service numbers",
    description: "Reads Australian 13 XX XX service numbers as 'thirteen' followed by the two remaining two-digit groups.",
    playgroundSample: "You can call 13 22 44.",
    pattern: SIX_DIGIT_SERVICE_REGEX,
    replacement: rewriteSixDigitServiceForSynthesis
  };
  var EN_AU_MOBILE_REWRITE = {
    label: "Mobile phone numbers",
    description: "Reads Australian mobile numbers in domestic 04XX XXX XXX form, or international +61 4XX XXX XXX form, using 'oh' for zero.",
    playgroundSample: "You can reach me on 0412345678 or +61 412 345 678.",
    pattern: MOBILE_REGEX,
    replacement: rewriteMobileForSynthesis
  };
  var EN_AU_LANDLINE_REWRITE = {
    label: "Landline phone numbers",
    description: "Reads Australian landline numbers in domestic 0X XXXX XXXX form, or international +61 X XXXX XXXX form, using natural digit groups.",
    playgroundSample: "You can reach the office on 02 1234 5678.",
    pattern: LANDLINE_REGEX,
    replacement: rewriteLandlineForSynthesis
  };
  var EN_AU_PHONE_REWRITES = [
    EN_AU_THIRTEEN_HUNDRED_SERVICE_REWRITE,
    EN_AU_EIGHTEEN_HUNDRED_SERVICE_REWRITE,
    EN_AU_SIX_DIGIT_SERVICE_REWRITE,
    EN_AU_MOBILE_REWRITE,
    EN_AU_LANDLINE_REWRITE,
    EN_AU_EMERGENCY_SERVICE_REWRITE
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-AU/synthesis-rewrites/index.ts
  var EN_AU_ADDRESS_IDS = [
    "en-au:state-postcode-pairs",
    "en-au:labelled-postcodes",
    "en-au:state-abbreviations"
  ];
  var EN_AU_PHONE_IDS = [
    "en-au:thirteen-hundred-service-numbers",
    "en-au:eighteen-hundred-service-numbers",
    "en-au:six-digit-service-numbers",
    "en-au:mobile-phone-numbers",
    "en-au:landline-phone-numbers",
    "en-au:emergency-service-number"
  ];
  var EN_AU_ACRONYM_IDS = [
    "en-au:acronym-ato",
    "en-au:acronym-asic",
    "en-au:acronym-apra",
    "en-au:acronym-acma",
    "en-au:acronym-accc",
    "en-au:acronym-austrac",
    "en-au:acronym-tfn",
    "en-au:acronym-abn",
    "en-au:acronym-acn",
    "en-au:acronym-bsb",
    "en-au:acronym-gst",
    "en-au:acronym-ndis",
    "en-au:acronym-hecs",
    "en-au:acronym-rba"
  ];
  var EN_AU_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    { id: "system:date", rule: ENGLISH_DAY_FIRST_DATE_REWRITE, expectedLabel: "Dates" },
    { id: "system:price", rule: EN_AU_CURRENCY_REWRITE, expectedLabel: "Currency" },
    ...EN_AU_ADDRESS_REWRITES.map((rule, index) => {
      const id = EN_AU_ADDRESS_IDS[index];
      if (!id) {
        throw new Error(`Missing en-AU address synthesis rewrite ID for index ${index}`);
      }
      return {
        id,
        rule,
        expectedLabel: rule.label
      };
    }),
    ...EN_AU_PHONE_REWRITES.map((rule, index) => {
      const id = EN_AU_PHONE_IDS[index];
      if (!id) {
        throw new Error(`Missing en-AU phone synthesis rewrite ID for index ${index}`);
      }
      return {
        id,
        rule,
        expectedLabel: rule.label
      };
    }),
    ...EN_AU_ACRONYM_REWRITES.map((rule, index) => {
      const id = EN_AU_ACRONYM_IDS[index];
      if (!id) {
        throw new Error(`Missing en-AU acronym synthesis rewrite ID for index ${index}`);
      }
      return {
        id,
        rule,
        expectedLabel: rule.label
      };
    })
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-GB/synthesis-rewrites/rules.ts
  var ONES3 = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  var TENS3 = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
  ];
  function spellNumber(n) {
    if (n < 0 || n > 99) {
      return null;
    }
    if (n < 20) {
      return ONES3[n] || null;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) {
      return TENS3[tens] || null;
    }
    return `${TENS3[tens]}-${ONES3[ones]}`;
  }
  var EN_GB_POSTCODE_REGEX = /\b[A-Z]{1,2}[0-9][0-9A-Z]? ?[0-9][A-Z]{2}\b/i;
  function rewriteEnGbPostcodeForSynthesis(text) {
    const normalized = text.toUpperCase().replace(/\s+/g, " ").trim();
    const spaceIdx = normalized.indexOf(" ");
    let outward;
    let inward;
    if (spaceIdx !== -1) {
      outward = normalized.slice(0, spaceIdx);
      inward = normalized.slice(spaceIdx + 1);
    } else {
      outward = normalized.slice(0, -3);
      inward = normalized.slice(-3);
    }
    if (!outward || inward.length !== 3) {
      return text;
    }
    return `<platform-spell group="${outward.length},3" ignoreSymbols="true">${outward} ${inward}</platform-spell>`;
  }
  var EN_GB_NI_NUMBER_REGEX = /\b[A-CEG-HJ-PR-TW-Z]{2} ?\d{2} ?\d{2} ?\d{2} ?[A-D]\b/i;
  function rewriteEnGbNiNumberForSynthesis(text) {
    const normalized = text.toUpperCase().replace(/\s+/g, "");
    if (normalized.length !== 9) {
      return text;
    }
    const spaced = `${normalized.slice(0, 2)} ${normalized.slice(2, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)} ${normalized[8]}`;
    return `<platform-spell ignoreSymbols="true">${spaced}</platform-spell>`;
  }
  var EN_GB_CURRENCY_REGEX = /-?[£€$]\d{1,3}(?:(?:,\d{3})+|\d*)(?:\.\d{2})?/;
  var CURRENCY_NAMES = {
    "\xA3": { singular: "pound", plural: "pounds", subunitSingular: "penny", subunitPlural: "pence" },
    "\u20AC": { singular: "euro", plural: "euros", subunitSingular: "cent", subunitPlural: "cents" },
    $: { singular: "dollar", plural: "dollars", subunitSingular: "cent", subunitPlural: "cents" }
  };
  function spellEnGbWholeNumber(n) {
    if (n === 0) {
      return "zero";
    }
    if (n < 0 || n >= 1e9) {
      return null;
    }
    if (n < 100) {
      return spellNumber(n);
    }
    if (n < 1e3) {
      const hundreds = Math.floor(n / 100);
      const remainder2 = n % 100;
      const hundredWord = ONES3[hundreds];
      if (!hundredWord) {
        return null;
      }
      const hundredsPart = `${hundredWord} hundred`;
      if (remainder2 === 0) {
        return hundredsPart;
      }
      const remainderPart2 = spellNumber(remainder2);
      if (!remainderPart2) {
        return null;
      }
      return `${hundredsPart} and ${remainderPart2}`;
    }
    if (n < 1e6) {
      const thousands = Math.floor(n / 1e3);
      const remainder2 = n % 1e3;
      const thousandsPart = `${spellEnGbWholeNumber(thousands)} thousand`;
      if (remainder2 === 0) {
        return thousandsPart;
      }
      const remainderPart2 = spellEnGbWholeNumber(remainder2);
      if (!remainderPart2) {
        return null;
      }
      return `${thousandsPart}${remainder2 < 100 ? " and " : ", "}${remainderPart2}`;
    }
    const millions = Math.floor(n / 1e6);
    const remainder = n % 1e6;
    const millionsPart = `${spellEnGbWholeNumber(millions)} million`;
    if (remainder === 0) {
      return millionsPart;
    }
    const remainderPart = spellEnGbWholeNumber(remainder);
    if (!remainderPart) {
      return null;
    }
    return `${millionsPart}${remainder < 100 ? " and " : ", "}${remainderPart}`;
  }
  function rewriteEnGbCurrencyForSynthesis(text) {
    let remaining = text.trim();
    const negative = remaining.startsWith("-");
    if (negative) {
      remaining = remaining.slice(1);
    }
    const symbol = remaining[0];
    const currencyNames = CURRENCY_NAMES[symbol];
    if (!currencyNames) {
      return text;
    }
    remaining = remaining.slice(1);
    const dotIndex = remaining.indexOf(".");
    const wholePart = dotIndex === -1 ? remaining : remaining.slice(0, dotIndex);
    const whole = Number.parseInt(wholePart.replace(/,/g, ""), 10);
    const fraction = dotIndex === -1 ? 0 : Number.parseInt(remaining.slice(dotIndex + 1), 10);
    if (Number.isNaN(whole) || Number.isNaN(fraction)) {
      return text;
    }
    const parts = [];
    if (whole > 0) {
      const spokenWhole = spellEnGbWholeNumber(whole);
      if (!spokenWhole) {
        return text;
      }
      parts.push(`${spokenWhole} ${whole === 1 ? currencyNames.singular : currencyNames.plural}`);
    }
    if (fraction > 0) {
      const spokenFraction = spellNumber(fraction);
      if (!spokenFraction) {
        return text;
      }
      parts.push(
        `${spokenFraction} ${fraction === 1 ? currencyNames.subunitSingular : currencyNames.subunitPlural}`
      );
    }
    if (parts.length === 0) {
      parts.push(`zero ${currencyNames.plural}`);
    }
    return `${negative ? "minus " : ""}${parts.join(" and ")}`;
  }
  var EN_GB_PHONE_REGEX = /(?<!\d)(?:\+44|0044|0)(?:[ -]?\d){10}(?!\d)/;
  function rewriteEnGbPhoneForSynthesis(text) {
    const normalized = text.replace(/[ -]/g, "");
    if (normalized.startsWith("+44")) {
      const digits = normalized.slice(3);
      if (digits.length !== 10 || /\D/.test(digits)) {
        return text;
      }
      const spaced = `+44 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
      return `<platform-spell group="3,4,3,3">${spaced}</platform-spell>`;
    }
    if (normalized.startsWith("0044")) {
      const digits = normalized.slice(4);
      if (digits.length !== 10 || /\D/.test(digits)) {
        return text;
      }
      const spaced = `0044 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
      return `<platform-spell group="4,4,3,3">${spaced}</platform-spell>`;
    }
    if (normalized.startsWith("0")) {
      if (normalized.length !== 11 || /\D/.test(normalized)) {
        return text;
      }
      const spaced = `${normalized.slice(0, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8, 11)}`;
      return `<platform-spell group="5,3,3" ignoreSymbols="true">${spaced}</platform-spell>`;
    }
    return text;
  }
  var EN_GB_LONG_DIGIT_REGEX = /(?<![+\d])(?<!\+\d\d\s)(?<!\)\s)\d(?:[ -]?\d){6,}(?!\d)/;
  var EN_GB_LONG_DIGIT_MIN_LENGTH = 7;
  function rewriteEnGbLongDigitsForSynthesis(text) {
    const digits = text.replace(/[ -]/g, "");
    if (digits.length < EN_GB_LONG_DIGIT_MIN_LENGTH || /\D/.test(digits)) {
      return text;
    }
    if (digits.startsWith("00") && digits.length >= 12) {
      return text;
    }
    const pairs = [];
    for (let i = 0; i < digits.length; i += 2) {
      pairs.push(digits.slice(i, i + 2));
    }
    return `<platform-spell group="2">${pairs.join(" ")}</platform-spell>`;
  }
  var EN_GB_KELLY_V2_SYNTHESIS_REWRITE_RULES = [
    {
      label: "Common British mispronunciations",
      description: "Corrects common British English words that tend to be mispronounced.",
      playgroundSample: "Your broadband package uses fibre optic technology.",
      pattern: /\bfibre\b/gi,
      replacement: (match) => /^[A-Z]/.test(match) ? "Fi-ber" : "fi-ber"
    }
  ];
  var EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    ENGLISH_DAY_FIRST_DATE_REWRITE,
    {
      label: "Postcodes",
      description: "Spells out UK postcodes character by character, grouping the outward code and inward code as separate 3-character chunks.",
      playgroundSample: "Please confirm your postcode is BS1 4DJ.",
      pattern: EN_GB_POSTCODE_REGEX,
      replacement: rewriteEnGbPostcodeForSynthesis
    },
    {
      id: "system:price",
      label: "Currency",
      description: "Converts \xA3, \u20AC and $ amounts to fully spoken British English.",
      playgroundSample: "Your balance is \xA31,234.56, or \u20AC1,420.12.",
      pattern: EN_GB_CURRENCY_REGEX,
      replacement: rewriteEnGbCurrencyForSynthesis
    },
    {
      label: "National Insurance numbers",
      description: "Spells out UK National Insurance numbers character by character, reading the two-letter prefix, three digit pairs, and suffix letter as separate groups.",
      playgroundSample: "Your National Insurance number is AB123456C.",
      // pragma: allowlist secret
      pattern: EN_GB_NI_NUMBER_REGEX,
      replacement: rewriteEnGbNiNumberForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads UK phone numbers digit by digit in natural groups: local 11-digit numbers in 5-3-3, +44 international numbers in 3-4-3-3, and 0044 international numbers in 4-4-3-3.",
      playgroundSample: "You can reach us on 07890627898.",
      pattern: EN_GB_PHONE_REGEX,
      replacement: rewriteEnGbPhoneForSynthesis
    },
    {
      label: "Long digit sequences",
      description: "Reads digit sequences of 7 or more characters in pairs of two (e.g. account numbers, references, IBANs).",
      playgroundSample: "Your reference number is 12345678.",
      pattern: EN_GB_LONG_DIGIT_REGEX,
      replacement: rewriteEnGbLongDigitsForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-GB/synthesis-rewrites/index.ts
  var EN_GB_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "en-gb:postcodes",
      rule: EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Postcodes"
    },
    {
      id: "system:price",
      rule: EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Currency"
    },
    {
      id: "en-gb:national-insurance-numbers",
      rule: EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "National Insurance numbers"
    },
    {
      id: "en-gb:phone-numbers",
      rule: EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Phone numbers"
    },
    {
      id: "en-gb:long-digit-sequences",
      rule: EN_GB_DEFAULT_SYNTHESIS_REWRITE_RULES[5],
      expectedLabel: "Long digit sequences"
    },
    {
      id: "en-gb:kelly-v2-common-mispronunciations",
      rule: EN_GB_KELLY_V2_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Common British mispronunciations"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-ID/synthesis-rewrites/rules.ts
  var DIGIT_WORDS2 = {
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine",
    "10": "ten"
  };
  var EN_ID_DEFAULT_SYNTHESIS_REWRITE_RULES = Object.entries(DIGIT_WORDS2).map(([digit, word]) => ({
    label: `${digit} to ${word}`,
    description: `Rewrites standalone ${digit} as "${word}" before English (en-ID) synthesis.`,
    playgroundSample: `Your queue number is ${digit}.`,
    pattern: new RegExp(`(?<![\\p{L}\\p{N}])${digit}(?![\\p{L}\\p{N}])`, "u"),
    replacement: word
  }));

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-ID/synthesis-rewrites/index.ts
  var EN_ID_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules(
    EN_ID_DEFAULT_SYNTHESIS_REWRITE_RULES.map((rule, index) => ({
      id: `en-id:digit-${index + 1}`,
      rule,
      expectedLabel: rule.label
    }))
  );

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-IE/synthesis-rewrites/rules.ts
  var ONES4 = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  var TENS4 = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
  ];
  function spellNumber2(n) {
    if (n < 0 || n > 99) {
      return null;
    }
    if (n < 20) {
      return ONES4[n] || null;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) {
      return TENS4[tens] || null;
    }
    return `${TENS4[tens]}-${ONES4[ones]}`;
  }
  var EN_IE_EIRCODE_REGEX = /\b[ACDEFHKNPRTVWXY][0-9][0-9W] ?[0-9ACDEFHKNPRTVWXY]{4}\b/i;
  function rewriteEnIeEircodeForSynthesis(text) {
    const normalized = text.toUpperCase().replace(/\s+/g, " ").trim();
    const spaceIdx = normalized.indexOf(" ");
    let routingKey;
    let uniqueIdentifier;
    if (spaceIdx !== -1) {
      routingKey = normalized.slice(0, spaceIdx);
      uniqueIdentifier = normalized.slice(spaceIdx + 1);
    } else {
      routingKey = normalized.slice(0, -4);
      uniqueIdentifier = normalized.slice(-4);
    }
    if (routingKey.length !== 3 || uniqueIdentifier.length !== 4) {
      return text;
    }
    return `<platform-spell group="3,4" ignoreSymbols="true">${routingKey} ${uniqueIdentifier}</platform-spell>`;
  }
  var EN_IE_PPSN_REGEX = /\b\d{7}[A-W][A-IW]?\b/i;
  function rewriteEnIePpsnForSynthesis(text) {
    const normalized = text.toUpperCase().replace(/\s+/g, "");
    const spaced = `${normalized[0]} ${normalized.slice(1, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7)}`;
    if (normalized.length === 8 || normalized.length === 9) {
      return `<platform-spell ignoreSymbols="true">${spaced}</platform-spell>`;
    }
    return text;
  }
  var EN_IE_CURRENCY_REGEX = /-?[€£$]\d{1,3}(?:(?:,\d{3})+|\d*)(?:\.\d{2})?/;
  var CURRENCY_NAMES2 = {
    "\u20AC": { singular: "euro", plural: "euros", subunitSingular: "cent", subunitPlural: "cents" },
    "\xA3": { singular: "pound", plural: "pounds", subunitSingular: "penny", subunitPlural: "pence" },
    $: { singular: "dollar", plural: "dollars", subunitSingular: "cent", subunitPlural: "cents" }
  };
  function spellEnIeWholeNumber(n) {
    if (n === 0) {
      return "zero";
    }
    if (n < 0 || n >= 1e9) {
      return null;
    }
    if (n < 100) {
      return spellNumber2(n);
    }
    if (n < 1e3) {
      const hundreds = Math.floor(n / 100);
      const remainder2 = n % 100;
      const hundredWord = ONES4[hundreds];
      if (!hundredWord) {
        return null;
      }
      const hundredsPart = `${hundredWord} hundred`;
      if (remainder2 === 0) {
        return hundredsPart;
      }
      const remainderPart2 = spellNumber2(remainder2);
      if (!remainderPart2) {
        return null;
      }
      return `${hundredsPart} and ${remainderPart2}`;
    }
    if (n < 1e6) {
      const thousands = Math.floor(n / 1e3);
      const remainder2 = n % 1e3;
      const thousandsPart = `${spellEnIeWholeNumber(thousands)} thousand`;
      if (remainder2 === 0) {
        return thousandsPart;
      }
      const remainderPart2 = spellEnIeWholeNumber(remainder2);
      if (!remainderPart2) {
        return null;
      }
      return `${thousandsPart}${remainder2 < 100 ? " and " : ", "}${remainderPart2}`;
    }
    const millions = Math.floor(n / 1e6);
    const remainder = n % 1e6;
    const millionsPart = `${spellEnIeWholeNumber(millions)} million`;
    if (remainder === 0) {
      return millionsPart;
    }
    const remainderPart = spellEnIeWholeNumber(remainder);
    if (!remainderPart) {
      return null;
    }
    return `${millionsPart}${remainder < 100 ? " and " : ", "}${remainderPart}`;
  }
  function rewriteEnIeCurrencyForSynthesis(text) {
    let remaining = text.trim();
    const negative = remaining.startsWith("-");
    if (negative) {
      remaining = remaining.slice(1);
    }
    const symbol = remaining[0];
    const currencyNames = CURRENCY_NAMES2[symbol];
    if (!currencyNames) {
      return text;
    }
    remaining = remaining.slice(1);
    const dotIndex = remaining.indexOf(".");
    const wholePart = dotIndex === -1 ? remaining : remaining.slice(0, dotIndex);
    const whole = Number.parseInt(wholePart.replace(/,/g, ""), 10);
    const fraction = dotIndex === -1 ? 0 : Number.parseInt(remaining.slice(dotIndex + 1), 10);
    if (Number.isNaN(whole) || Number.isNaN(fraction)) {
      return text;
    }
    const parts = [];
    if (whole > 0) {
      const spokenWhole = spellEnIeWholeNumber(whole);
      if (!spokenWhole) {
        return text;
      }
      parts.push(`${spokenWhole} ${whole === 1 ? currencyNames.singular : currencyNames.plural}`);
    }
    if (fraction > 0) {
      const spokenFraction = spellNumber2(fraction);
      if (!spokenFraction) {
        return text;
      }
      parts.push(
        `${spokenFraction} ${fraction === 1 ? currencyNames.subunitSingular : currencyNames.subunitPlural}`
      );
    }
    if (parts.length === 0) {
      parts.push(`zero ${currencyNames.plural}`);
    }
    return `${negative ? "minus " : ""}${parts.join(" and ")}`;
  }
  var EN_IE_PHONE_REGEX = /(?<!\d)(?:\+353|0)(?:[ -]?\d){9}(?!\d)/;
  function rewriteEnIePhoneForSynthesis(text) {
    const normalized = text.replace(/[ -]/g, "");
    if (normalized.startsWith("+353")) {
      const digits = normalized.slice(4);
      if (digits.length !== 9 || /\D/.test(digits)) {
        return text;
      }
      const spaced = `+353 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
      return `<platform-spell group="4,2,3,4">${spaced}</platform-spell>`;
    }
    if (normalized.startsWith("0")) {
      if (normalized.length !== 10 || /\D/.test(normalized)) {
        return text;
      }
      const spaced = `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 10)}`;
      return `<platform-spell group="3,3,4" ignoreSymbols="true">${spaced}</platform-spell>`;
    }
    return text;
  }
  var EN_IE_LONG_DIGIT_MIN_LENGTH = 7;
  var EN_IE_LONG_DIGIT_REGEX = /(?<![+\d])(?<!\+\d\d\d\s)(?<!\)\s)\d(?:[ -]?\d){6,}(?!\d)/;
  function rewriteEnIeLongDigitsForSynthesis(text) {
    const digits = text.replace(/[ -]/g, "");
    if (digits.length < EN_IE_LONG_DIGIT_MIN_LENGTH || /\D/.test(digits)) {
      return text;
    }
    if (digits.startsWith("00") && digits.length >= 12) {
      return text;
    }
    const pairs = [];
    for (let i = 0; i < digits.length; i += 2) {
      pairs.push(digits.slice(i, i + 2));
    }
    return `<platform-spell group="2">${pairs.join(" ")}</platform-spell>`;
  }
  var EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    ENGLISH_DAY_FIRST_DATE_REWRITE,
    {
      label: "Eircodes",
      description: "Spells out Irish Eircodes character by character, reading the 3-character routing key and 4-character unique identifier as separate groups.",
      playgroundSample: "Please confirm your Eircode is A65 F4E2.",
      pattern: EN_IE_EIRCODE_REGEX,
      replacement: rewriteEnIeEircodeForSynthesis
    },
    {
      id: "system:price",
      label: "Currency",
      description: "Converts \u20AC, \xA3 and $ amounts to fully spoken Irish English.",
      playgroundSample: "Your balance is \u20AC1,234.56, or \xA31,420.12.",
      pattern: EN_IE_CURRENCY_REGEX,
      replacement: rewriteEnIeCurrencyForSynthesis
    },
    {
      label: "PPS numbers",
      description: "Spells out Irish PPS numbers character by character, reading the leading digit, three digit pairs, and one or two suffix letters as separate groups.",
      playgroundSample: "Your PPS number is 1234567T.",
      pattern: EN_IE_PPSN_REGEX,
      replacement: rewriteEnIePpsnForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads Irish phone numbers digit by digit in natural groups: local 10-digit numbers in 3-3-4, and +353 international numbers in 4-2-3-4.",
      playgroundSample: "You can reach us on +353831234567.",
      pattern: EN_IE_PHONE_REGEX,
      replacement: rewriteEnIePhoneForSynthesis
    },
    {
      label: "Long digit sequences",
      description: "Reads digit sequences of 7 or more characters in pairs of two (e.g. account numbers, references, IBANs).",
      playgroundSample: "Your reference number is 12345678.",
      pattern: EN_IE_LONG_DIGIT_REGEX,
      replacement: rewriteEnIeLongDigitsForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-IE/synthesis-rewrites/index.ts
  var EN_IE_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "en-ie:eircodes",
      rule: EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Eircodes"
    },
    {
      id: "system:price",
      rule: EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Currency"
    },
    {
      id: "en-ie:pps-numbers",
      rule: EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "PPS numbers"
    },
    {
      id: "en-ie:phone-numbers",
      rule: EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Phone numbers"
    },
    {
      id: "en-ie:long-digit-sequences",
      rule: EN_IE_DEFAULT_SYNTHESIS_REWRITE_RULES[5],
      expectedLabel: "Long digit sequences"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-NZ/synthesis-rewrites.ts
  var EN_NZ_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    { id: "system:date", rule: ENGLISH_DAY_FIRST_DATE_REWRITE, expectedLabel: "Dates" }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-SG/synthesis-rewrites/acronyms.ts
  var ACRONYM_REWRITES = [
    { pattern: /\bnric\b/i, replacement: "N R I C" },
    { pattern: "FIN", replacement: "finn" }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-SG/synthesis-rewrites/nric.ts
  var fullNricRegex = /\b([STFGM])(\d{7})([A-Z])\b/gi;
  function spellOutFullNric(text) {
    const match = text.match(/([STFGM])\d{7}[A-Z]/i);
    if (!match) {
      return text;
    }
    return `<platform-spell radio="true">${match[0]}</platform-spell>`;
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-SG/synthesis-rewrites/place-names.ts
  var PLACE_NAME_REWRITES = [
    { pattern: /\btampines\b/i, replacement: "tam-per-nis" }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-SG/synthesis-rewrites/index.ts
  var EN_SG_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    { id: "system:date", rule: ENGLISH_DAY_FIRST_DATE_REWRITE, expectedLabel: "Dates" },
    {
      id: "en-sg:acronym-nric",
      rule: {
        ...ACRONYM_REWRITES[0],
        label: "Acronym: NRIC",
        description: "Spells out the Singapore NRIC acronym.",
        playgroundSample: "Please provide your NRIC."
      },
      expectedLabel: "Acronym: NRIC"
    },
    {
      id: "en-sg:fin",
      rule: {
        ...ACRONYM_REWRITES[1],
        label: "FIN acronym",
        description: "Pronounces FIN using the Singapore spoken form.",
        playgroundSample: "Please provide your FIN."
      },
      expectedLabel: "FIN acronym"
    },
    {
      id: "en-sg:tampines",
      rule: {
        ...PLACE_NAME_REWRITES[0],
        label: "Tampines place name",
        description: "Pronounces Tampines with a clearer Singapore English reading.",
        playgroundSample: "The branch is in Tampines."
      },
      expectedLabel: "Tampines place name"
    },
    {
      id: "en-sg:full-nric",
      rule: {
        label: "Full NRIC",
        description: "Spells out full Singapore NRIC and FIN values using phonetic letters.",
        playgroundSample: "Your NRIC is S1234567A.",
        pattern: fullNricRegex,
        replacement: spellOutFullNric
      },
      expectedLabel: "Full NRIC"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-US/synthesis-rewrites/rules.ts
  var EN_US_PRICE_REGEX = /(^|\s)(-?[$£€]\d{1,3}((,\d{3})*|\d*)(\.\d{2})?)\b/;
  var EN_US_DATE_REGEX = /\b(\d{1,2}\/\d{1,2}\/(\d{4}|\d{2}))|(\d{1,2}-\d{1,2}-(\d{4}|\d{2}))\b/;
  var EN_US_DAY_RANGE_REGEX = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*-\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/;
  var EN_US_TIME_RANGE_REGEX = /\b(1[0-2]|0?[1-9])(:[0-5][0-9])?\s?(AM|PM)?\s*-\s*(1[0-2]|0?[1-9])(:[0-5][0-9])?\s?(AM|PM)?\b/i;
  var EN_US_EMAIL_REGEX = /([\w.+-]+)@([a-zA-Z\d.-]+)\.([a-zA-Z]{2,6})/;
  var CURRENCY_NAMES3 = {
    $: { singular: "dollar", plural: "dollars", subunitSingular: "cent", subunitPlural: "cents" },
    "\xA3": { singular: "pound", plural: "pounds", subunitSingular: "penny", subunitPlural: "pence" },
    "\u20AC": { singular: "euro", plural: "euros", subunitSingular: "cent", subunitPlural: "cents" }
  };
  var LESS_THAN_TWENTY = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  var TENS5 = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  var THOUSANDS = ["", "thousand", "million", "billion"];
  var TWENTY_FIRST_CENTURY_THRESHOLD3 = 30;
  var MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  function optionString(options, key) {
    const value = options[key];
    return typeof value === "string" ? value : void 0;
  }
  function isSupportedEnglishLocale(locale = "") {
    return locale.length === 0 || locale.startsWith("en");
  }
  function spellOutSmallNumber(num) {
    if (num === 0) {
      return "";
    } else if (num < 20) {
      return `${LESS_THAN_TWENTY[num]} `;
    } else if (num < 100) {
      return `${TENS5[Math.floor(num / 10)]} ${spellOutSmallNumber(num % 10)}`;
    }
    return `${LESS_THAN_TWENTY[Math.floor(num / 100)]} hundred ${spellOutSmallNumber(num % 100)}`;
  }
  function spellOutNumber(num) {
    let result = "";
    for (let i = 0; num > 0; i++) {
      num = Math.round(num);
      if (num % 1e3 !== 0) {
        result = `${spellOutSmallNumber(num % 1e3) + THOUSANDS[i]} ${result}`;
      }
      num = Math.floor(num / 1e3);
    }
    return result.trim();
  }
  function rewriteEnUsPriceForSynthesis(origPrice, options) {
    if (!isSupportedEnglishLocale(optionString(options, "locale"))) {
      return origPrice;
    }
    const submatches = EN_US_PRICE_REGEX.exec(origPrice);
    if (!submatches || submatches.length < 3) {
      return origPrice;
    }
    const leadingSpace = submatches[1];
    let trimmedPrice = submatches[2];
    if (trimmedPrice.length < 1) {
      return origPrice;
    }
    let negative = false;
    if (trimmedPrice.startsWith("-")) {
      negative = true;
      trimmedPrice = trimmedPrice.slice(1);
    }
    const prefix = trimmedPrice[0];
    const currencyName = CURRENCY_NAMES3[prefix];
    if (!currencyName) {
      return origPrice;
    }
    const priceParts = trimmedPrice.slice(prefix.length).split(".");
    const whole = Number.parseInt(priceParts[0].replace(/,/g, ""), 10);
    if (Number.isNaN(whole)) {
      return origPrice;
    }
    let unit = whole === 1 ? currencyName.singular : currencyName.plural;
    let rewrittenPriceParts = [];
    if (whole > 0) {
      rewrittenPriceParts.push(`${spellOutNumber(whole)} ${unit}`);
    }
    if (priceParts.length > 1) {
      const fraction = Number.parseInt(priceParts[1], 10);
      if (Number.isNaN(fraction)) {
        return origPrice;
      }
      if (fraction > 0) {
        if (fraction === 99 && whole > 0) {
          rewrittenPriceParts = [`${spellOutNumber(whole)} ninety-nine`];
        } else {
          unit = fraction === 1 ? currencyName.subunitSingular : currencyName.subunitPlural;
          rewrittenPriceParts.push(`${spellOutNumber(fraction)} ${unit}`);
        }
      }
    }
    let pricePrefix = leadingSpace;
    if (rewrittenPriceParts.length === 0) {
      rewrittenPriceParts.push(`zero ${unit}`);
    } else if (negative) {
      pricePrefix += "negative ";
    }
    return pricePrefix + rewrittenPriceParts.join(" and ");
  }
  function normalizeEnUsDate(dateParts) {
    const month = Number.parseInt(dateParts[0], 10);
    const day = Number.parseInt(dateParts[1], 10);
    let year = Number.parseInt(dateParts[2], 10);
    if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
      return null;
    }
    if (year < 100) {
      year = year < TWENTY_FIRST_CENTURY_THRESHOLD3 ? 2e3 + year : 1900 + year;
    }
    if (year < 1900) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  }
  function rewriteEnUsDateForSynthesis(origDate, options) {
    if (!isSupportedEnglishLocale(optionString(options, "locale"))) {
      return origDate;
    }
    const parts = origDate.includes("/") ? origDate.split("/") : origDate.split("-");
    const date = normalizeEnUsDate(parts);
    if (date === null) {
      return origDate;
    }
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  function rewriteEnUsRangeForSynthesis(origRange, options) {
    if (!isSupportedEnglishLocale(optionString(options, "locale"))) {
      return origRange;
    }
    const rangeParts = origRange.split("-");
    return `${rangeParts[0].trimEnd()} to ${rangeParts[1].trimStart()}`;
  }
  function spellOutPunctuation(text) {
    return text.replace(/\+/g, " plus ").replace(/_/g, " underscore ").replace(/-/g, " hyphen ").replace(/\./g, " dot ");
  }
  function rewriteEnUsEmailForSynthesis(text, options) {
    if (!isSupportedEnglishLocale(optionString(options, "locale"))) {
      return text;
    }
    const emailParts = text.split("@");
    if (emailParts.length < 2) {
      return text;
    }
    return `${spellOutPunctuation(emailParts[0])} at ${spellOutPunctuation(emailParts[1])}`;
  }
  var EN_US_DATE_REWRITE = {
    label: "Date",
    description: "Reads numeric month/day/year dates as spoken US English dates.",
    playgroundSample: "Your subscription will be active until 10/08/2025.",
    pattern: EN_US_DATE_REGEX,
    replacement: rewriteEnUsDateForSynthesis
  };
  var EN_US_DAY_RANGE_REWRITE = {
    label: "Day range",
    description: 'Reads weekday ranges with "to" instead of a hyphen.',
    playgroundSample: "Our associates are available Monday-Friday.",
    pattern: EN_US_DAY_RANGE_REGEX,
    replacement: rewriteEnUsRangeForSynthesis
  };
  var EN_US_TIME_RANGE_REWRITE = {
    label: "Time range",
    description: 'Reads time ranges with "to" instead of a hyphen.',
    playgroundSample: "We are open 9AM-5PM.",
    pattern: EN_US_TIME_RANGE_REGEX,
    replacement: rewriteEnUsRangeForSynthesis
  };
  var EN_US_PRICE_REWRITE = {
    label: "Price",
    description: "Reads common dollar, pound, and euro prices as spoken amounts.",
    playgroundSample: "Your order total was $1,137.09.",
    pattern: EN_US_PRICE_REGEX,
    replacement: rewriteEnUsPriceForSynthesis
  };
  var EN_US_EMAIL_REWRITE = {
    label: "Email",
    description: "Reads email punctuation as words.",
    playgroundSample: "The order email is julie+second_t@test.com.",
    pattern: EN_US_EMAIL_REGEX,
    replacement: rewriteEnUsEmailForSynthesis
  };
  var EN_US_401K_REWRITE = {
    label: "401(k)",
    description: 'Reads "401k" and "401(k)" as "four oh one kay".',
    playgroundSample: "Your 401k contribution is on track.",
    pattern: /(?<![$\w])401(?:\s?\(\s*k\s*\)|\s?k)(?=s\b|[^\w]|$)/gi,
    replacement: "four oh one kay"
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-US/synthesis-rewrites/index.ts
  var EN_US_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: EN_US_DATE_REWRITE,
      expectedLabel: "Date"
    },
    {
      id: "system:day-range",
      rule: EN_US_DAY_RANGE_REWRITE,
      expectedLabel: "Day range"
    },
    {
      id: "system:time-range",
      rule: EN_US_TIME_RANGE_REWRITE,
      expectedLabel: "Time range"
    },
    {
      id: "system:price",
      rule: EN_US_PRICE_REWRITE,
      expectedLabel: "Price"
    },
    {
      id: "system:email",
      rule: EN_US_EMAIL_REWRITE,
      expectedLabel: "Email"
    },
    {
      id: "en-us:401k",
      rule: EN_US_401K_REWRITE,
      expectedLabel: "401(k)"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/en-ZA/synthesis-rewrites.ts
  var EN_ZA_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    { id: "system:date", rule: ENGLISH_DAY_FIRST_DATE_REWRITE, expectedLabel: "Dates" }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-AR/synthesis-rewrites/rules.ts
  var ARGENTINA_NUMERIC_DATE_REGEX = /\b(?:(\d{1,2}\/\d{1,2}\/(\d{4}|\d{2}))|(\d{1,2}-\d{1,2}-(\d{4}|\d{2})))\b/;
  var SPANISH_MONTH_NAMES = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ];
  var SPANISH_ONES = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve"
  ];
  var SPANISH_TEENS = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "diecis\xE9is",
    "diecisiete",
    "dieciocho",
    "diecinueve"
  ];
  var SPANISH_TENS = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa"
  ];
  var SPANISH_TWENTIES = [
    "",
    "veintiuno",
    "veintid\xF3s",
    "veintitr\xE9s",
    "veinticuatro",
    "veinticinco",
    "veintis\xE9is",
    "veintisiete",
    "veintiocho",
    "veintinueve"
  ];
  function spellSpanishNumberBelow100(value) {
    if (value < 0 || value >= 100) {
      return null;
    }
    if (value < 10) {
      return SPANISH_ONES[value] || null;
    }
    if (value < 20) {
      return SPANISH_TEENS[value - 10] || null;
    }
    if (value < 30) {
      return value === 20 ? "veinte" : SPANISH_TWENTIES[value - 20] || null;
    }
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    if (ones === 0) {
      return SPANISH_TENS[tens] || null;
    }
    return `${SPANISH_TENS[tens]} y ${SPANISH_ONES[ones]}`;
  }
  function spellSpanishDay(day) {
    if (day < 1 || day > 31) {
      return null;
    }
    if (day === 1) {
      return "primero";
    }
    return spellSpanishNumberBelow100(day);
  }
  function spellSpanishYear(year) {
    if (year === 2e3) {
      return "dos mil";
    }
    if (year > 2e3 && year < 2100) {
      const suffix = spellSpanishNumberBelow100(year - 2e3);
      return suffix ? `dos mil ${suffix}` : null;
    }
    if (year === 1900) {
      return "mil novecientos";
    }
    if (year > 1900 && year < 2e3) {
      const suffix = spellSpanishNumberBelow100(year - 1900);
      return suffix ? `mil novecientos ${suffix}` : null;
    }
    return null;
  }
  function rewriteSpanishArgentinaDateForSynthesis(text) {
    const separator = text.includes("/") ? "/" : text.includes("-") ? "-" : null;
    if (!separator) {
      return text;
    }
    const [firstPart, secondPart, yearPart] = text.split(separator);
    const firstValue = Number.parseInt(firstPart, 10);
    const secondValue = Number.parseInt(secondPart, 10);
    const rawYear = Number.parseInt(yearPart, 10);
    if (Number.isNaN(firstValue) || Number.isNaN(secondValue) || Number.isNaN(rawYear)) {
      return text;
    }
    const year = yearPart.length === 2 ? 2e3 + rawYear : rawYear;
    const dayMonthYear = isValidGregorianDate(year, secondValue, firstValue) ? { day: firstValue, month: secondValue } : isValidGregorianDate(year, firstValue, secondValue) ? { day: secondValue, month: firstValue } : null;
    if (!dayMonthYear) {
      return text;
    }
    const spokenDay = spellSpanishDay(dayMonthYear.day);
    const spokenMonth = SPANISH_MONTH_NAMES[dayMonthYear.month - 1];
    const spokenYear = spellSpanishYear(year);
    if (!spokenDay || !spokenYear) {
      return text;
    }
    return `${spokenDay} de ${spokenMonth} de ${spokenYear}`;
  }
  var ES_AR_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      label: "Date normalization",
      description: "Converts numeric dates into fully spoken Spanish, assuming Argentinian standard formatting of DD/MM/YYYY. Falls back to MM/DD/YYYY if only valid option.",
      playgroundSample: "La reuni\xF3n ser\xE1 el 04/02/2026 en la oficina de Buenos Aires.",
      pattern: ARGENTINA_NUMERIC_DATE_REGEX,
      replacement: rewriteSpanishArgentinaDateForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-AR/synthesis-rewrites/index.ts
  var ES_AR_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "es-ar:date-normalization",
      rule: ES_AR_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Date normalization"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-ES/synthesis-rewrite-definitions.ts
  var ES_ES_SYNTHESIS_REWRITE_DEFINITIONS = {
    spell: {
      letters: {
        A: "A de Alicante",
        B: "B de Barcelona",
        C: "C de C\xE1ceres",
        D: "D de Dinamarca",
        E: "E de Espa\xF1a",
        F: "F de Francia",
        G: "G de Granada",
        H: "H de Huelva",
        I: "I de Italia",
        J: "J de Ja\xE9n",
        K: "K de Kilo",
        L: "L de Lugo",
        M: "M de Madrid",
        N: "N de Navarra",
        \u00D1: "e\xF1e",
        O: "O de Oviedo",
        P: "P de Pamplona",
        Q: "Q de Queso",
        R: "R de Roma",
        S: "S de Sevilla",
        T: "T de Teruel",
        U: "U de Uruguay",
        V: "V de Valencia",
        W: "uve doble",
        X: "equis",
        Y: "y griega",
        Z: "Z de Zaragoza",
        \u00C1: "A con acento",
        \u00C9: "E con acento",
        \u00CD: "I con acento",
        \u00D3: "O con acento",
        \u00DA: "U con acento",
        \u00DC: "U con di\xE9resis"
      },
      digits: {
        "0": { text: "cero" },
        "1": { text: "uno" },
        "2": { text: "dos" },
        "3": { text: "tres" },
        "4": { text: "cuatro" },
        "5": { text: "cinco" },
        "6": { text: "seis" },
        "7": { text: "siete" },
        "8": { text: "ocho" },
        "9": { text: "nueve" }
      },
      spokenSymbols: {
        "-": "guion",
        "@": "arroba",
        "&": "et",
        "*": "asterisco",
        ",": "coma",
        ".": "punto",
        "_": "guion bajo",
        "/": "barra",
        ":": "dos puntos",
        ";": "punto y coma",
        "'": "ap\xF3strofo",
        '"': "comillas",
        "\u2013": "guion",
        "\u2014": "guion",
        "\u2018": "ap\xF3strofo",
        "\u2019": "ap\xF3strofo",
        "\u201C": "abre comillas",
        "\u201D": "cierra comillas",
        "\u2026": "puntos suspensivos"
      }
    }
  };

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-ES/synthesis-rewrites/rules.ts
  var DIGITS = [
    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve"
  ];
  var MONTHS2 = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ];
  var ONES5 = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve"
  ];
  var TEENS = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "diecis\xE9is",
    "diecisiete",
    "dieciocho",
    "diecinueve"
  ];
  var TENS6 = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa"
  ];
  var TWENTIES = [
    "",
    "veintiuno",
    "veintid\xF3s",
    "veintitr\xE9s",
    "veinticuatro",
    "veinticinco",
    "veintis\xE9is",
    "veintisiete",
    "veintiocho",
    "veintinueve"
  ];
  var HUNDREDS = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos"
  ];
  function spellNumberBelow100(value) {
    if (value < 0 || value >= 100) {
      return null;
    }
    if (value < 10) {
      return DIGITS[value];
    }
    if (value < 20) {
      return TEENS[value - 10];
    }
    if (value < 30) {
      return value === 20 ? "veinte" : TWENTIES[value - 20];
    }
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return ones === 0 ? TENS6[tens] : `${TENS6[tens]} y ${ONES5[ones]}`;
  }
  function spellWholeNumber2(value) {
    if (value < 0 || value >= 1e6) {
      return null;
    }
    if (value < 100) {
      return spellNumberBelow100(value);
    }
    if (value === 100) {
      return "cien";
    }
    if (value < 1e3) {
      const hundreds = Math.floor(value / 100);
      const rest = value % 100;
      const prefix = HUNDREDS[hundreds];
      if (!prefix) {
        return null;
      }
      return rest === 0 ? prefix : `${prefix} ${spellNumberBelow100(rest)}`;
    }
    if (value === 1e3) {
      return "mil";
    }
    if (value < 1e6) {
      const thousands = Math.floor(value / 1e3);
      const rest = value % 1e3;
      const thousandsText = spellWholeNumber2(thousands);
      if (!thousandsText) {
        return null;
      }
      const prefix = thousands === 1 ? "mil" : `${masculineCountText(thousandsText)} mil`;
      return rest === 0 ? prefix : `${prefix} ${spellWholeNumber2(rest)}`;
    }
    return null;
  }
  var SPELL_DEFINITIONS = ES_ES_SYNTHESIS_REWRITE_DEFINITIONS.spell;
  function spellIdentifierChar(ch) {
    const digit = Number.parseInt(ch, 10);
    if (!Number.isNaN(digit) && digit >= 0 && digit <= 9) {
      return SPELL_DEFINITIONS.digits[ch]?.text ?? DIGITS[digit];
    }
    return SPELL_DEFINITIONS.letters[ch.toUpperCase()] ?? ch.toUpperCase();
  }
  function spellIdentifier(value) {
    return value.replace(/[\s-]/g, "").split("").map(spellIdentifierChar).join(" ");
  }
  var ES_ES_DATE_REGEX = /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2})\b/g;
  var ES_ES_SLASH_DATE_REGEX = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/;
  var ES_ES_ISO_DATE_REGEX = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/;
  function rewriteDate2(text) {
    const slashMatch = text.match(ES_ES_SLASH_DATE_REGEX);
    const isoMatch = slashMatch ? null : text.match(ES_ES_ISO_DATE_REGEX);
    if (!slashMatch && !isoMatch) {
      return text;
    }
    const day = Number.parseInt(slashMatch ? slashMatch[1] : isoMatch[3], 10);
    const month = Number.parseInt(slashMatch ? slashMatch[2] : isoMatch[2], 10);
    const rawYear = Number.parseInt(slashMatch ? slashMatch[3] : isoMatch[1], 10);
    if (month < 1 || month > 12) {
      return text;
    }
    const year = rawYear < 100 ? 2e3 + rawYear : rawYear;
    const dayText = spellWholeNumber2(day);
    const yearText = spellWholeNumber2(year);
    const monthText = MONTHS2[month - 1];
    if (!dayText || !yearText) {
      return text;
    }
    return `${dayText} de ${monthText} de ${yearText}`;
  }
  var ES_ES_TIME_REGEX = /(?:(?:a\s+)?las\s+)?\b(?:[01]?\d|2[0-3]):[0-5]\d\b/gi;
  var ES_ES_PARSE_TIME_REGEX = /^(?:(a\s+)?las\s+)?([01]?\d|2[0-3]):([0-5]\d)$/i;
  function clockHourText(hour24) {
    const hour12 = hour24 % 12 || 12;
    return hour12 === 1 ? "una" : spellWholeNumber2(hour12);
  }
  function clockPrefix({
    hour24,
    hasArticlePrefix,
    hasPrepositionPrefix
  }) {
    if (hasPrepositionPrefix) {
      return hour24 % 12 === 1 ? "a la " : "a las ";
    }
    if (hasArticlePrefix) {
      return hour24 % 12 === 1 ? "la " : "las ";
    }
    return "";
  }
  function dayPartForHour(hour24) {
    if (hour24 < 6) {
      return " de la madrugada";
    }
    if (hour24 < 20) {
      return "";
    }
    return " de la noche";
  }
  function rewriteTime(text) {
    const match = text.match(ES_ES_PARSE_TIME_REGEX);
    if (!match) {
      return text;
    }
    const hasArticlePrefix = /\blas\s+/i.test(match[0]);
    const hasPrepositionPrefix = /^a\s+las\s+/i.test(match[0]);
    const hour24 = Number.parseInt(match[2], 10);
    const minute = Number.parseInt(match[3], 10);
    if (hour24 === 0 && minute === 0) {
      return hasPrepositionPrefix ? "a medianoche" : "medianoche";
    }
    if (hour24 === 12 && minute === 0) {
      return hasPrepositionPrefix ? "a mediod\xEDa" : "mediod\xEDa";
    }
    const hourText = clockHourText(hour24);
    if (!hourText) {
      return text;
    }
    const prefix = clockPrefix({ hour24, hasArticlePrefix, hasPrepositionPrefix });
    const dayPart = dayPartForHour(hour24);
    if (minute === 0) {
      return `${prefix}${hourText} en punto${dayPart}`;
    }
    if (minute === 15) {
      return `${prefix}${hourText} y cuarto${dayPart}`;
    }
    if (minute === 30) {
      return `${prefix}${hourText} y media${dayPart}`;
    }
    if (minute < 30) {
      const minuteText = spellWholeNumber2(minute);
      return minuteText ? `${prefix}${hourText} y ${minuteText}${dayPart}` : text;
    }
    const nextHour24 = (hour24 + 1) % 24;
    const nextHourText = clockHourText(nextHour24);
    const remainingMinutes = 60 - minute;
    const remainingText = remainingMinutes === 15 ? "cuarto" : spellWholeNumber2(remainingMinutes);
    if (!nextHourText || !remainingText) {
      return text;
    }
    const nextPrefix = clockPrefix({
      hour24: nextHour24,
      hasArticlePrefix,
      hasPrepositionPrefix
    });
    return `${nextPrefix}${nextHourText} menos ${remainingText}${dayPart}`;
  }
  var ES_ES_EURO_REGEX = /-?(?:€\s?\d{1,3}(?:(?:\.\d{3})+|\d*)(?:,\d{1,2})?(?![\d,]|\.\d)|\d{1,3}(?:(?:\.\d{3})+|\d*)(?:,\d{1,2})?(?![\d,]|\.\d)\s?€)/g;
  function parseSpanishAmount(raw) {
    const numeric = raw.replace(/[€\s]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "");
    const normalized = numeric.replace(",", ".");
    const [eurosPart, centsPart = ""] = normalized.split(".");
    const euros = Number.parseInt(eurosPart, 10);
    const cents = Number.parseInt(centsPart.padEnd(2, "0").slice(0, 2) || "0", 10);
    if (Number.isNaN(euros) || Number.isNaN(cents)) {
      return null;
    }
    return { euros: Math.abs(euros), cents };
  }
  function masculineCountText(text) {
    if (text === "uno") {
      return "un";
    }
    if (text.endsWith("veintiuno")) {
      return `${text.slice(0, -"veintiuno".length)}veinti\xFAn`;
    }
    if (text.endsWith(" y uno")) {
      return `${text.slice(0, -" y uno".length)} y un`;
    }
    if (text.endsWith(" uno")) {
      return `${text.slice(0, -" uno".length)} un`;
    }
    return text;
  }
  function rewriteEuroAmount(text) {
    const negative = text.trim().startsWith("-");
    const amount = parseSpanishAmount(text);
    if (!amount) {
      return text;
    }
    const euroText = spellWholeNumber2(amount.euros);
    const centText = spellWholeNumber2(amount.cents);
    if (!euroText || !centText) {
      return text;
    }
    const parts = [];
    if (amount.euros > 0) {
      parts.push(`${masculineCountText(euroText)} ${amount.euros === 1 ? "euro" : "euros"}`);
    }
    if (amount.cents > 0) {
      parts.push(
        `${masculineCountText(centText)} ${amount.cents === 1 ? "c\xE9ntimo" : "c\xE9ntimos"}`
      );
    }
    if (parts.length === 0) {
      parts.push("cero euros");
    }
    return `${negative ? "menos " : ""}${parts.join(" con ")}`;
  }
  var ES_ES_IDENTIFIER_REGEX = /\b(?:\d{8}[- ]?[A-Z]|[XYZ][- ]?\d{7}[- ]?[A-Z]|[ABCDEFGHJKLMNPQRSUVW][- ]?\d{7}[- ]?[0-9A-J])\b/gi;
  var ES_ES_PHONE_REGEX = /(?<!\d)(?:(?:\+34|0034|34)[ -]?)?[6789](?:[ -]?\d){8}(?!\d)/g;
  function rewritePhoneNumber(text) {
    const normalized = text.replace(/[ -]/g, "");
    const hasPlusPrefix = normalized.startsWith("+34");
    const hasInternationalPrefix = hasPlusPrefix || normalized.startsWith("0034") || normalized.startsWith("34");
    const digits = hasPlusPrefix ? normalized.slice(3) : normalized.startsWith("0034") ? normalized.slice(4) : normalized.startsWith("34") ? normalized.slice(2) : normalized;
    if (digits.length !== 9 || /\D/.test(digits)) {
      return text;
    }
    const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)];
    const spoken = groups.map(spellIdentifier).join(", ");
    return hasInternationalPrefix ? `m\xE1s treinta y cuatro, ${spoken}` : spoken;
  }
  var ES_ES_DATA_AMOUNT_REGEX = /\b\d{1,3}\s?GBs?\b/gi;
  var ES_ES_PARSE_DATA_AMOUNT_REGEX = /\b(\d{1,3})\s?GBs?\b/i;
  function rewriteDataAmount(text) {
    const match = text.match(ES_ES_PARSE_DATA_AMOUNT_REGEX);
    const amount = match ? Number.parseInt(match[1], 10) : Number.NaN;
    const amountText = Number.isNaN(amount) ? null : spellWholeNumber2(amount);
    return amountText ? `${amountText} gigas` : text;
  }
  var ES_ES_LONG_DIGIT_REGEX = /(?<![+\d])\d(?:[ -]?\d){6,}(?!\d)/g;
  function rewriteLongDigits(text) {
    const digits = text.replace(/[ -]/g, "");
    if (digits.length < 7 || /\D/.test(digits)) {
      return text;
    }
    return digits.split("").map(spellIdentifierChar).join(" ");
  }
  var ES_ES_STANDALONE_NUMBER_REGEX = /(?<![\w@.,/:-])\d{1,6}(?![\w@./:-]|,\d)/g;
  function rewriteStandaloneNumber(text) {
    const value = Number.parseInt(text.replace(/\./g, ""), 10);
    if (!Number.isFinite(value)) {
      return text;
    }
    return spellWholeNumber2(value) ?? text;
  }
  var ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      id: "system:date",
      label: "Dates",
      description: "Reads Spanish dates in day-month-year order using Spanish words.",
      playgroundSample: "La cita es el 13/05/2026.",
      pattern: ES_ES_DATE_REGEX,
      replacement: rewriteDate2
    },
    {
      label: "Times",
      description: "Reads appointment times as natural Spanish speech without inserting 'y'.",
      playgroundSample: "La cita es a las 16:40.",
      pattern: ES_ES_TIME_REGEX,
      replacement: rewriteTime
    },
    {
      id: "system:price",
      label: "Euro amounts",
      description: "Reads euro amounts as euros and cents, never as decimal points.",
      playgroundSample: "El importe es 12,40\u20AC.",
      pattern: ES_ES_EURO_REGEX,
      replacement: rewriteEuroAmount
    },
    {
      label: "Spanish identity numbers",
      description: "Spells DNI, NIE and CIF-style identifiers character by character.",
      playgroundSample: "Su DNI es 12345678A.",
      pattern: ES_ES_IDENTIFIER_REGEX,
      replacement: spellIdentifier
    },
    {
      label: "Spanish phone numbers",
      description: "Reads Spanish phone numbers in 3-3-3 digit groups.",
      playgroundSample: "Puede llamarnos al +34 612 345 678.",
      pattern: ES_ES_PHONE_REGEX,
      replacement: rewritePhoneNumber
    },
    {
      label: "Common acronyms and terms",
      description: "Normalizes high-impact Spanish service acronyms and short spoken forms.",
      playgroundSample: "DNI, NIF, IBAN, 112, M30, M40, V-16, IA, km, TPV y CVV.",
      pattern: /\b(?:DNI|NIF|CIF|IBAN|112|M30|M40|V-16|IA|km|GB|GBs|TPV|CVV|24\/7)\b/gi,
      replacement: (text) => {
        const normalized = text.toUpperCase();
        const replacements = {
          NIF: "ene i efe",
          CIF: "ce i efe",
          IBAN: "ib\xE1n",
          "112": "uno uno dos",
          M30: "eme treinta",
          M40: "eme cuarenta",
          "V-16": "uve diecis\xE9is",
          IA: "\xEDa",
          KM: "kil\xF3metros",
          GB: "gigas",
          GBS: "gigas",
          TPV: "tepeuve",
          CVV: "ce uveuve",
          "24/7": "veinticuatro horas"
        };
        return replacements[normalized] ?? text;
      }
    },
    {
      label: "Data amounts",
      description: "Reads mobile data amounts such as 4GB in Spanish.",
      playgroundSample: "El plan incluye 4GB de datos.",
      pattern: ES_ES_DATA_AMOUNT_REGEX,
      replacement: rewriteDataAmount
    },
    {
      label: "Long digit sequences",
      description: "Spells long numeric identifiers digit by digit.",
      playgroundSample: "El c\xF3digo de referencia es 12345678.",
      pattern: ES_ES_LONG_DIGIT_REGEX,
      replacement: rewriteLongDigits
    },
    {
      label: "Standalone numbers",
      description: "Reads small standalone numbers in Spanish words.",
      playgroundSample: "La opci\xF3n 18 est\xE1 disponible.",
      pattern: ES_ES_STANDALONE_NUMBER_REGEX,
      replacement: rewriteStandaloneNumber
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/es-ES/synthesis-rewrites/index.ts
  var ES_ES_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "es-es:times",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Times"
    },
    {
      id: "system:price",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Euro amounts"
    },
    {
      id: "es-es:identity-numbers",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Spanish identity numbers"
    },
    {
      id: "es-es:phone-numbers",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Spanish phone numbers"
    },
    {
      id: "es-es:common-acronyms-and-terms",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[5],
      expectedLabel: "Common acronyms and terms"
    },
    {
      id: "es-es:data-amounts",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[6],
      expectedLabel: "Data amounts"
    },
    {
      id: "es-es:long-digit-sequences",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[7],
      expectedLabel: "Long digit sequences"
    },
    {
      id: "es-es:standalone-numbers",
      rule: ES_ES_DEFAULT_SYNTHESIS_REWRITE_RULES[8],
      expectedLabel: "Standalone numbers"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fi-FI/synthesis-rewrites/rules.ts
  function caseAwareReplacement(replacement) {
    return (match) => {
      if (/^\p{Lu}/u.test(match)) {
        return `${replacement.charAt(0).toUpperCase()}${replacement.slice(1)}`;
      }
      return replacement;
    };
  }
  var FI_FI_CURRENCY_REGEX = /(?<![\d–—-])-?(?:(?:\d{1,3}(?:[ .]\d{3})+|\d{1,9})(?:,\d{1,2})?\s?(?:€|[eE][uU][rR](?![\p{L}]))|€\s?(?:\d{1,3}(?:[ .]\d{3})+|\d{1,9})(?:,\d{1,2})?)/u;
  function rewriteFiFiCurrencyForSynthesis(text) {
    let body = text.trim();
    const negative = body.startsWith("-");
    if (negative) {
      body = body.slice(1).trimStart();
    }
    body = body.replace(/^€\s?/, "").replace(/\s?(?:€|EUR)$/i, "").trim();
    body = body.replace(/[ .]/g, "");
    const [wholePart, fractionPart = ""] = body.split(",");
    const whole = Number.parseInt(wholePart, 10);
    if (Number.isNaN(whole)) {
      return text;
    }
    let fraction = 0;
    if (fractionPart) {
      const padded = fractionPart.length === 1 ? `${fractionPart}0` : fractionPart;
      fraction = Number.parseInt(padded, 10);
      if (Number.isNaN(fraction)) {
        return text;
      }
    }
    const parts = [];
    if (whole > 0) {
      parts.push(`${whole} ${whole === 1 ? "euro" : "euroa"}`);
    }
    if (fraction > 0) {
      parts.push(`${fraction} ${fraction === 1 ? "sentti" : "sentti\xE4"}`);
    }
    if (parts.length === 0) {
      parts.push("nolla euroa");
    }
    return `${negative ? "miinus " : ""}${parts.join(" ja ")}`;
  }
  var FI_FI_PERCENTAGE_REGEX = /(?<![\d–—-])(?<sign>[+-])?(?<amount>\d+(?:[,.]\d+)?)\s?%(?::(?<suffix>n|iin|sta))?(?![\p{L}-])/u;
  function rewriteFiFiPercentageForSynthesis(text) {
    const match = FI_FI_PERCENTAGE_REGEX.exec(text);
    const amount = match?.groups?.["amount"];
    if (!amount) {
      return text;
    }
    const sign = match.groups?.["sign"];
    const prefix = sign === "-" ? "miinus " : sign === "+" ? "plus " : "";
    const normalizedAmount = amount.replace(".", ",");
    const value = Number.parseFloat(amount.replace(",", "."));
    switch (match.groups?.["suffix"]) {
      case "n":
        return `${prefix}${normalizedAmount} prosentin`;
      case "iin":
        return `${prefix}${normalizedAmount} prosenttiin`;
      case "sta":
        return `${prefix}${normalizedAmount} prosentista`;
      default:
        return `${prefix}${normalizedAmount} ${value === 1 ? "prosentti" : "prosenttia"}`;
    }
  }
  var FI_FI_TIME_ABBREVIATION_REGEX = /(?<![\p{L}])klo\.?(?![\p{L}])/giu;
  var FI_FI_HOUSING_COMPANY_ABBREVIATION_REGEX = /(?<![\p{L}])(?:as\.?\s+oy|asunto\s+oy)(?::(?<suffix>n|lle|ssä))?(?![\p{L}])/giu;
  function rewriteFiFiHousingCompanyAbbreviationForSynthesis(text) {
    const suffix = /:(n|lle|ssä)$/iu.exec(text)?.[1]?.toLowerCase();
    const replacement = suffix === "n" ? "asunto-osakeyhti\xF6n" : suffix === "lle" ? "asunto-osakeyhti\xF6lle" : suffix === "ss\xE4" ? "asunto-osakeyhti\xF6ss\xE4" : "asunto-osakeyhti\xF6";
    return caseAwareReplacement(replacement)(text);
  }
  var FI_FI_VAT_ABBREVIATION_REGEX = /(?<![\p{L}])alv(?::(?<suffix>n|ia|ssa|tä))?(?![\p{L}-])/giu;
  function rewriteFiFiVatAbbreviationForSynthesis(text) {
    switch (/:(n|ia|ssa|tä)$/iu.exec(text)?.[1]?.toLowerCase()) {
      case "n":
        return "alvin";
      case "ia":
      case "t\xE4":
        return "alvia";
      case "ssa":
        return "alvissa";
      default:
        return "alvi";
    }
  }
  var FI_FI_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      id: "system:price",
      label: "Currency",
      description: "Converts euro amounts with \u20AC or EUR to spoken Finnish euros and cents.",
      playgroundSample: "Saldo on 48,90 \u20AC ja hyvitys on 5 EUR.",
      pattern: FI_FI_CURRENCY_REGEX,
      replacement: rewriteFiFiCurrencyForSynthesis
    },
    {
      label: "Percentages",
      description: "Converts percentages with % to spoken Finnish.",
      playgroundSample: "ALV on 24 %.",
      pattern: FI_FI_PERCENTAGE_REGEX,
      replacement: rewriteFiFiPercentageForSynthesis
    },
    {
      label: "Time abbreviation",
      description: "Reads the Finnish time abbreviation 'klo' as 'kello'.",
      playgroundSample: "Aika on klo 13.00.",
      pattern: FI_FI_TIME_ABBREVIATION_REGEX,
      replacement: caseAwareReplacement("kello")
    },
    {
      label: "Housing company abbreviation",
      description: "Reads 'As Oy' as the Finnish long form 'asunto-osakeyhti\xF6'.",
      playgroundSample: "As Oy Koivu k\xE4sittelee pyynn\xF6n.",
      pattern: FI_FI_HOUSING_COMPANY_ABBREVIATION_REGEX,
      replacement: rewriteFiFiHousingCompanyAbbreviationForSynthesis
    },
    {
      label: "VAT acronym",
      description: "Reads 'ALV' as the common Finnish spoken form 'alvi' with common colon suffixes.",
      playgroundSample: "Hinta sis\xE4lt\xE4\xE4 ALV:n.",
      pattern: FI_FI_VAT_ABBREVIATION_REGEX,
      replacement: rewriteFiFiVatAbbreviationForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fi-FI/synthesis-rewrites/index.ts
  var FI_FI_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:price",
      rule: FI_FI_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Currency"
    },
    {
      id: "fi-fi:percentages",
      rule: FI_FI_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Percentages"
    },
    {
      id: "fi-fi:time-abbreviation",
      rule: FI_FI_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Time abbreviation"
    },
    {
      id: "fi-fi:housing-company-abbreviation",
      rule: FI_FI_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Housing company abbreviation"
    },
    {
      id: "fi-fi:vat-acronym",
      rule: FI_FI_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "VAT acronym"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-CA/synthesis-rewrites/rules.ts
  var FR_CA_ISO_DATE_REGEX = /(?:\ble\s+)?\d{4}-\d{2}-\d{2}\b/iu;
  var FR_CA_POSTAL_CODE_REGEX = /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/i;
  var FR_CA_PHONE_NUMBER_REGEX = /(?<!\w)(?:\+?1[ -]?)?(?:\([2-9]\d{2}\)[ -]?|[2-9]\d{2}[ -])[2-9]\d{2}[ -]\d{4}(?:[ -]?(?:poste|ext\.?|x)\s*\d{1,6})?(?!\w)/i;
  var FR_CA_CURRENCY_REGEX = /(?<!\w)(?:-?\$\s*\d{1,3}(?:(?:[ ,]\d{3})+|\d*)(?:[.,]\d{2})?|-?\d{1,3}(?:(?:[ ,]\d{3})+|\d*)(?:[.,]\d{2})?\s*(?:\$|CAD))(?!\w)/i;
  var FR_CA_TIME_H_REGEX = /\b(?:[01]?\d|2[0-3])\s*h(?:\s*[0-5]\d)?\b/i;
  var MONTH_NAMES2 = [
    "janvier",
    "f\xE9vrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "ao\xFBt",
    "septembre",
    "octobre",
    "novembre",
    "d\xE9cembre"
  ];
  var DIGIT_WORDS3 = [
    "z\xE9ro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf"
  ];
  var BELOW_SEVENTEEN = [
    "z\xE9ro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize"
  ];
  var TENS7 = {
    20: "vingt",
    30: "trente",
    40: "quarante",
    50: "cinquante",
    60: "soixante"
  };
  function spellFrBelowHundred(value) {
    if (!Number.isInteger(value) || value < 0 || value >= 100) {
      return null;
    }
    if (value <= 16) {
      return BELOW_SEVENTEEN[value] ?? null;
    }
    if (value < 20) {
      return `dix-${BELOW_SEVENTEEN[value - 10]}`;
    }
    if (value < 70) {
      const tens = Math.floor(value / 10) * 10;
      const ones = value % 10;
      const tensWord = TENS7[tens];
      if (ones === 0) {
        return tensWord;
      }
      if (ones === 1) {
        return `${tensWord} et un`;
      }
      const onesWord = spellFrBelowHundred(ones);
      return onesWord ? `${tensWord}-${onesWord}` : null;
    }
    if (value < 80) {
      const remainder2 = value - 60;
      if (remainder2 === 11) {
        return "soixante et onze";
      }
      const remainderWord2 = spellFrBelowHundred(remainder2);
      return remainderWord2 ? `soixante-${remainderWord2}` : null;
    }
    if (value === 80) {
      return "quatre-vingts";
    }
    const remainder = value - 80;
    if (remainder === 1) {
      return "quatre-vingt-un";
    }
    const remainderWord = spellFrBelowHundred(remainder);
    return remainderWord ? `quatre-vingt-${remainderWord}` : null;
  }
  function spellFrBelowThousand(value) {
    if (!Number.isInteger(value) || value < 0 || value >= 1e3) {
      return null;
    }
    if (value < 100) {
      return spellFrBelowHundred(value);
    }
    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;
    const hundredsPrefix = hundreds === 1 ? "cent" : `${spellFrBelowHundred(hundreds) ?? ""} cent`.trim();
    if (!hundredsPrefix) {
      return null;
    }
    if (remainder === 0) {
      return hundreds > 1 ? `${hundredsPrefix}s` : hundredsPrefix;
    }
    const remainderWord = spellFrBelowHundred(remainder);
    return remainderWord ? `${hundredsPrefix} ${remainderWord}` : null;
  }
  function spellFrInteger(value) {
    if (!Number.isSafeInteger(value) || value < 0 || value >= 1e9) {
      return null;
    }
    if (value < 1e3) {
      return spellFrBelowThousand(value);
    }
    if (value < 1e6) {
      const thousands = Math.floor(value / 1e3);
      const remainder2 = value % 1e3;
      const thousandsWord = thousands === 1 ? "mille" : `${spellFrBelowThousand(thousands)} mille`;
      if (!thousandsWord) {
        return null;
      }
      if (remainder2 === 0) {
        return thousandsWord;
      }
      const remainderWord2 = spellFrBelowThousand(remainder2);
      return remainderWord2 ? `${thousandsWord} ${remainderWord2}` : null;
    }
    const millions = Math.floor(value / 1e6);
    const remainder = value % 1e6;
    const millionsRoot = spellFrBelowThousand(millions);
    if (!millionsRoot) {
      return null;
    }
    const millionsWord = `${millions === 1 ? "un" : millionsRoot} million${millions > 1 ? "s" : ""}`;
    if (remainder === 0) {
      return millionsWord;
    }
    const remainderWord = spellFrInteger(remainder);
    return remainderWord ? `${millionsWord} ${remainderWord}` : null;
  }
  function isValidGregorianDate2(year, month, day) {
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  function spellDateDay(day) {
    if (day < 1 || day > 31) {
      return null;
    }
    if (day === 1) {
      return "premier";
    }
    return spellFrInteger(day);
  }
  function maybeStripLeadingLe(text) {
    const normalized = text.trimStart();
    if (/^le\s+/iu.test(normalized)) {
      return { hadLeadingLe: true, raw: normalized.replace(/^le\s+/iu, "") };
    }
    return { hadLeadingLe: false, raw: normalized };
  }
  function rewriteFrCaIsoDateForSynthesis(text) {
    const { raw } = maybeStripLeadingLe(text);
    const parts = raw.split("-");
    if (parts.length !== 3) {
      return text;
    }
    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const day = Number.parseInt(parts[2], 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return text;
    }
    if (!isValidGregorianDate2(year, month, day)) {
      return text;
    }
    const spokenDay = spellDateDay(day);
    const spokenYear = spellFrInteger(year);
    const monthName = MONTH_NAMES2[month - 1];
    if (!spokenDay || !spokenYear) {
      return text;
    }
    return `le ${spokenDay} ${monthName} ${spokenYear}`;
  }
  function rewriteFrCaPostalCodeForSynthesis(text) {
    const normalized = text.toUpperCase().replace(/[ -]/g, "");
    if (normalized.length !== 6) {
      return text;
    }
    const chars = [...normalized];
    const firstDigit = Number.parseInt(chars[1], 10);
    const secondDigit = Number.parseInt(chars[3], 10);
    const thirdDigit = Number.parseInt(chars[5], 10);
    if (Number.isNaN(firstDigit) || Number.isNaN(secondDigit) || Number.isNaN(thirdDigit)) {
      return text;
    }
    return `${chars[0]} ${DIGIT_WORDS3[firstDigit]} ${chars[2]} ${DIGIT_WORDS3[secondDigit]} ${chars[4]} ${DIGIT_WORDS3[thirdDigit]}`;
  }
  function rewriteFrCaPhoneForSynthesis(text) {
    const extMatch = text.match(/(?:poste|ext\.?|x)\s*(\d{1,6})/i);
    const extensionDigits = extMatch?.[1] ?? null;
    const withoutExtension = extMatch ? text.slice(0, extMatch.index).trim() : text;
    const digits = withoutExtension.replace(/\D/g, "");
    const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    if (normalized.length !== 10) {
      return text;
    }
    const groups = [normalized.slice(0, 3), normalized.slice(3, 6), normalized.slice(6, 10)];
    const base = groups.map((group) => [...group].map((ch) => DIGIT_WORDS3[Number.parseInt(ch, 10)] ?? ch).join(" ")).join(", ");
    if (!extensionDigits) {
      return base;
    }
    const spokenExtension = [...extensionDigits].map((ch) => DIGIT_WORDS3[Number.parseInt(ch, 10)] ?? ch).join(" ");
    return `${base}, poste ${spokenExtension}`;
  }
  function parseFrCaCurrency(text) {
    const hasCurrencyMarker = /\$|\bCAD\b/i.test(text);
    if (!hasCurrencyMarker) {
      return null;
    }
    const trimmed = text.trim();
    const strictPrefixPattern = /^-?\$\s*(?:\d+|\d{1,3}(?:(?:,\d{3})+|(?: \d{3})+))(?:[.,]\d{2})?$/u;
    const strictSuffixPattern = /^-?(?:\d+|\d{1,3}(?:(?:,\d{3})+|(?: \d{3})+))(?:[.,]\d{2})?\s*(?:\$|CAD)$/iu;
    if (!strictPrefixPattern.test(trimmed) && !strictSuffixPattern.test(trimmed)) {
      return null;
    }
    let normalized = text.toUpperCase().replace(/\s+/g, "").replace(/CAD/g, "").replace(/\$/g, "");
    if (!normalized) {
      return null;
    }
    const negative = normalized.startsWith("-");
    if (negative) {
      normalized = normalized.slice(1);
    }
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    let decimalIdx = -1;
    if (lastComma !== -1 && lastDot !== -1) {
      decimalIdx = Math.max(lastComma, lastDot);
    } else if (lastComma !== -1) {
      decimalIdx = normalized.length - lastComma - 1 === 2 ? lastComma : -1;
    } else if (lastDot !== -1) {
      decimalIdx = normalized.length - lastDot - 1 === 2 ? lastDot : -1;
    }
    const wholeRaw = decimalIdx === -1 ? normalized.replace(/\D/g, "") : normalized.slice(0, decimalIdx).replace(/\D/g, "");
    const fractionRaw = decimalIdx === -1 ? "" : normalized.slice(decimalIdx + 1).replace(/\D/g, "").slice(0, 2).padEnd(2, "0");
    if (!wholeRaw && !fractionRaw) {
      return null;
    }
    if (wholeRaw.length > 9) {
      return null;
    }
    const dollars = wholeRaw ? Number.parseInt(wholeRaw, 10) : 0;
    const cents = fractionRaw ? Number.parseInt(fractionRaw, 10) : 0;
    if (Number.isNaN(dollars) || Number.isNaN(cents) || cents < 0 || cents > 99) {
      return null;
    }
    return { negative, dollars, cents };
  }
  function rewriteFrCaCurrencyForSynthesis(text) {
    const amount = parseFrCaCurrency(text);
    if (!amount) {
      return text;
    }
    const spokenDollars = spellFrInteger(amount.dollars);
    const spokenCents = amount.cents > 0 ? spellFrInteger(amount.cents) : null;
    if (!spokenDollars || amount.cents > 0 && !spokenCents) {
      return text;
    }
    const pieces = [
      `${spokenDollars} ${amount.dollars <= 1 ? "dollar" : "dollars"}`,
      ...amount.cents > 0 ? [`${spokenCents} ${amount.cents === 1 ? "cent" : "cents"}`] : []
    ];
    const spoken = pieces.join(" et ");
    return amount.negative ? `moins ${spoken}` : spoken;
  }
  function rewriteFrCaTimeForSynthesis(text) {
    const normalized = text.trim().toLowerCase();
    const match = normalized.match(/^(\d{1,2})\s*h(?:\s*(\d{2}))?$/);
    if (!match) {
      return text;
    }
    const hour = Number.parseInt(match[1], 10);
    const minute = match[2] ? Number.parseInt(match[2], 10) : 0;
    if (Number.isNaN(hour) || Number.isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return text;
    }
    const hourWord = hour === 1 ? "une" : hour === 21 ? "vingt et une" : spellFrBelowHundred(hour);
    const minuteWord = spellFrBelowHundred(minute);
    if (!hourWord || minuteWord === null) {
      return text;
    }
    const hourUnit = hour === 0 || hour === 1 ? "heure" : "heures";
    if (minute === 0) {
      return `${hourWord} ${hourUnit}`;
    }
    return `${hourWord} ${hourUnit} ${minuteWord}`;
  }
  var FR_CA_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      label: "ISO dates",
      description: "Converts ISO dates (YYYY-MM-DD) into spoken French.",
      playgroundSample: "Les rendez-vous sont pr\xE9vus le 2026-02-04, le 2026-02-01 et le 2026-12-31.",
      pattern: FR_CA_ISO_DATE_REGEX,
      replacement: rewriteFrCaIsoDateForSynthesis
    },
    {
      label: "Postal codes",
      description: "Reads Canadian postal codes character by character in two groups of three.",
      playgroundSample: "Veuillez confirmer les codes postaux H2X 1Y4, h3z2y7 et G1A-0B1.",
      pattern: FR_CA_POSTAL_CODE_REGEX,
      replacement: rewriteFrCaPostalCodeForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads clearly formatted North American phone numbers digit by digit in 3-3-4 groups.",
      playgroundSample: "Vous pouvez nous joindre au (514) 555-1234, au +1 438 555 5678, ou au 450-555-0000 poste 123.",
      pattern: FR_CA_PHONE_NUMBER_REGEX,
      replacement: rewriteFrCaPhoneForSynthesis
    },
    {
      label: "Currency",
      description: "Converts CAD currency amounts into fully spoken French when $ or CAD is present.",
      playgroundSample: "Le montant total est de 0,99 $ pour l\u2019article A et de 1 234,50 $ pour l\u2019article B.",
      pattern: FR_CA_CURRENCY_REGEX,
      replacement: rewriteFrCaCurrencyForSynthesis
    },
    {
      label: "Time (h format)",
      description: "Converts French h-formatted times to spoken French.",
      playgroundSample: "Le rendez-vous est \xE0 9 h 05, le suivi est pr\xE9vu \xE0 14 h 00, et la ligne ouvre \xE0 0 h 00.",
      pattern: FR_CA_TIME_H_REGEX,
      replacement: rewriteFrCaTimeForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-CA/synthesis-rewrites/index.ts
  var FR_CA_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "fr-ca:iso-dates",
      rule: FR_CA_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "ISO dates"
    },
    {
      id: "fr-ca:postal-codes",
      rule: FR_CA_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Postal codes"
    },
    {
      id: "fr-ca:phone-numbers",
      rule: FR_CA_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Phone numbers"
    },
    {
      id: "fr-ca:currency",
      rule: FR_CA_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Currency"
    },
    {
      id: "fr-ca:time-h-format",
      rule: FR_CA_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Time (h format)"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-FR/synthesis-rewrites/rules.ts
  var MONTH_NAMES3 = [
    "janvier",
    "f\xE9vrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "ao\xFBt",
    "septembre",
    "octobre",
    "novembre",
    "d\xE9cembre"
  ];
  var DIGIT_WORDS4 = [
    "z\xE9ro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf"
  ];
  var BELOW_SEVENTEEN2 = [
    "z\xE9ro",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize"
  ];
  var TENS8 = {
    20: "vingt",
    30: "trente",
    40: "quarante",
    50: "cinquante",
    60: "soixante"
  };
  function spellFrBelowHundred2(value) {
    if (!Number.isInteger(value) || value < 0 || value >= 100) {
      return null;
    }
    if (value <= 16) {
      return BELOW_SEVENTEEN2[value] ?? null;
    }
    if (value < 20) {
      return `dix-${BELOW_SEVENTEEN2[value - 10]}`;
    }
    if (value < 70) {
      const tens = Math.floor(value / 10) * 10;
      const ones = value % 10;
      const tensWord = TENS8[tens];
      if (ones === 0) {
        return tensWord;
      }
      if (ones === 1) {
        return `${tensWord} et un`;
      }
      const onesWord = spellFrBelowHundred2(ones);
      return onesWord ? `${tensWord}-${onesWord}` : null;
    }
    if (value < 80) {
      const remainder2 = value - 60;
      if (remainder2 === 11) {
        return "soixante et onze";
      }
      const remainderWord2 = spellFrBelowHundred2(remainder2);
      return remainderWord2 ? `soixante-${remainderWord2}` : null;
    }
    if (value === 80) {
      return "quatre-vingts";
    }
    const remainder = value - 80;
    if (remainder === 1) {
      return "quatre-vingt-un";
    }
    const remainderWord = spellFrBelowHundred2(remainder);
    return remainderWord ? `quatre-vingt-${remainderWord}` : null;
  }
  function spellFrBelowThousand2(value) {
    if (!Number.isInteger(value) || value < 0 || value >= 1e3) {
      return null;
    }
    if (value < 100) {
      return spellFrBelowHundred2(value);
    }
    const hundreds = Math.floor(value / 100);
    const remainder = value % 100;
    const hundredsPrefix = hundreds === 1 ? "cent" : `${spellFrBelowHundred2(hundreds) ?? ""} cent`.trim();
    if (!hundredsPrefix) {
      return null;
    }
    if (remainder === 0) {
      return hundreds > 1 ? `${hundredsPrefix}s` : hundredsPrefix;
    }
    const remainderWord = spellFrBelowHundred2(remainder);
    return remainderWord ? `${hundredsPrefix} ${remainderWord}` : null;
  }
  function stripFinalSBeforeMille(word) {
    return word.replace(/(cent|vingt)s$/, "$1");
  }
  function spellFrInteger2(value) {
    if (!Number.isSafeInteger(value) || value < 0 || value >= 1e12) {
      return null;
    }
    if (value < 1e3) {
      return spellFrBelowThousand2(value);
    }
    if (value < 1e6) {
      const thousands = Math.floor(value / 1e3);
      const remainder2 = value % 1e3;
      let thousandsWord;
      if (thousands === 1) {
        thousandsWord = "mille";
      } else {
        const thousandsRoot = spellFrBelowThousand2(thousands);
        if (!thousandsRoot) {
          return null;
        }
        thousandsWord = `${stripFinalSBeforeMille(thousandsRoot)} mille`;
      }
      if (remainder2 === 0) {
        return thousandsWord;
      }
      const remainderWord2 = spellFrBelowThousand2(remainder2);
      return remainderWord2 ? `${thousandsWord} ${remainderWord2}` : null;
    }
    if (value < 1e9) {
      const millions = Math.floor(value / 1e6);
      const remainder2 = value % 1e6;
      const millionsRoot = spellFrBelowThousand2(millions);
      if (!millionsRoot) {
        return null;
      }
      const millionsWord = `${millions === 1 ? "un" : millionsRoot} million${millions > 1 ? "s" : ""}`;
      if (remainder2 === 0) {
        return millionsWord;
      }
      const remainderWord2 = spellFrInteger2(remainder2);
      return remainderWord2 ? `${millionsWord} ${remainderWord2}` : null;
    }
    const billions = Math.floor(value / 1e9);
    const remainder = value % 1e9;
    const billionsRoot = spellFrBelowThousand2(billions);
    if (!billionsRoot) {
      return null;
    }
    const billionsWord = `${billions === 1 ? "un" : billionsRoot} milliard${billions > 1 ? "s" : ""}`;
    if (remainder === 0) {
      return billionsWord;
    }
    const remainderWord = spellFrInteger2(remainder);
    return remainderWord ? `${billionsWord} ${remainderWord}` : null;
  }
  function isValidGregorianDate3(year, month, day) {
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  function spellDateDay2(day) {
    if (day < 1 || day > 31) {
      return null;
    }
    if (day === 1) {
      return "premier";
    }
    return spellFrInteger2(day);
  }
  function spellTwoDigitPair(pair) {
    if (pair.length !== 2 || /\D/.test(pair)) {
      return null;
    }
    if (pair.startsWith("0")) {
      return `${DIGIT_WORDS4[0]} ${DIGIT_WORDS4[Number.parseInt(pair[1], 10)]}`;
    }
    return spellFrBelowHundred2(Number.parseInt(pair, 10)) ?? null;
  }
  var FR_FR_DATE_REGEX = /(?:\ble\s+)?\b\d{1,2}([/-])\d{1,2}\1\d{2}(?:\d{2})?\b/iu;
  var FR_FR_TWO_DIGIT_YEAR_CUTOFF = 40;
  function maybeStripLeadingLe2(text) {
    const normalized = text.trimStart();
    if (/^le\s+/iu.test(normalized)) {
      return { hadLeadingLe: true, raw: normalized.replace(/^le\s+/iu, "") };
    }
    return { hadLeadingLe: false, raw: normalized };
  }
  function resolveYear(yearText) {
    if (!/^\d{2}(?:\d{2})?$/.test(yearText)) {
      return null;
    }
    const year = Number.parseInt(yearText, 10);
    if (Number.isNaN(year)) {
      return null;
    }
    if (yearText.length === 4) {
      return year;
    }
    return year < FR_FR_TWO_DIGIT_YEAR_CUTOFF ? 2e3 + year : 1900 + year;
  }
  function rewriteFrFrDateForSynthesis(text) {
    const { hadLeadingLe, raw } = maybeStripLeadingLe2(text);
    const separator = raw.includes("/") ? "/" : raw.includes("-") ? "-" : null;
    if (!separator) {
      return text;
    }
    const parts = raw.split(separator);
    if (parts.length !== 3) {
      return text;
    }
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const year = resolveYear(parts[2]);
    if (Number.isNaN(day) || Number.isNaN(month) || year === null) {
      return text;
    }
    if (!isValidGregorianDate3(year, month, day)) {
      return text;
    }
    const spokenDay = spellDateDay2(day);
    const spokenYear = spellFrInteger2(year);
    const monthName = MONTH_NAMES3[month - 1];
    if (!spokenDay || !spokenYear) {
      return text;
    }
    const prefix = hadLeadingLe ? "le " : "";
    return `${prefix}${spokenDay} ${monthName} ${spokenYear}`;
  }
  var FR_FR_PHONE_REGEX = /(?<!\d)(?:(?:\+33|0033)[ .-]?[1-9](?:[ .-]?\d{2}){4}|0[1-9](?:[ .-]?\d{2}){4})(?!\d)/;
  function spellNationalDigits(nationalDigits) {
    if (nationalDigits.length !== 9 || /\D/.test(nationalDigits)) {
      return null;
    }
    const first = nationalDigits[0];
    const firstDigit = Number.parseInt(first, 10);
    if (Number.isNaN(firstDigit)) {
      return null;
    }
    const groups = [DIGIT_WORDS4[firstDigit]];
    for (let i = 1; i < nationalDigits.length; i += 2) {
      const spoken = spellTwoDigitPair(nationalDigits.slice(i, i + 2));
      if (!spoken) {
        return null;
      }
      groups.push(spoken);
    }
    return groups;
  }
  function rewriteFrFrPhoneForSynthesis(text) {
    const digits = text.replace(/[ .-]/g, "");
    if (digits.startsWith("+33")) {
      const national = digits.slice(3);
      const groups = spellNationalDigits(national);
      if (!groups) {
        return text;
      }
      return ["plus trente-trois", ...groups].join(", ");
    }
    if (digits.startsWith("0033")) {
      const national = digits.slice(4);
      const groups = spellNationalDigits(national);
      if (!groups) {
        return text;
      }
      return ["z\xE9ro z\xE9ro, trente-trois", ...groups].join(", ");
    }
    if (digits.length !== 10 || !digits.startsWith("0") || /\D/.test(digits)) {
      return text;
    }
    const pairs = [];
    for (let i = 0; i < digits.length; i += 2) {
      const spoken = spellTwoDigitPair(digits.slice(i, i + 2));
      if (!spoken) {
        return text;
      }
      pairs.push(spoken);
    }
    return pairs.join(", ");
  }
  var FR_FR_POSTAL_CODE_REGEX = /<PostCode>\s*\d{5}\s*<\/PostCode>/iu;
  var FR_FR_POSTAL_CODE_WITH_CAPTURE_REGEX = /<PostCode>\s*(\d{5})\s*<\/PostCode>/iu;
  function rewriteFrFrPostalCodeForSynthesis(text) {
    if (!/^\d{5}$/.test(text)) {
      return text;
    }
    const department = spellTwoDigitPair(text.slice(0, 2));
    if (!department) {
      return text;
    }
    const commune = text.slice(2);
    if (!commune.startsWith("0")) {
      const communeWord = spellFrBelowThousand2(Number.parseInt(commune, 10));
      if (communeWord) {
        return `${department}, ${communeWord}`;
      }
    }
    if (/^0[1-9]\d$/.test(commune)) {
      const pair = spellTwoDigitPair(commune.slice(1));
      if (pair) {
        return `${department}, z\xE9ro ${pair}`;
      }
    }
    return `${department}, <platform-spell>${commune}</platform-spell>`;
  }
  function rewriteFrFrPostalCodeTagForSynthesis(text) {
    const match = text.match(FR_FR_POSTAL_CODE_WITH_CAPTURE_REGEX);
    if (!match) {
      return text;
    }
    return rewriteFrFrPostalCodeForSynthesis(match[1]);
  }
  var FR_FR_CURRENCY_REGEX = /(?<![\p{L}\d.,])(?:-?(?:\d{1,3}(?:[ \u00A0.]\d{3})+|\d+)(?:,\d{1,2})?\s?(?:[€$£]|EUR|euros?)|[€$£]\s?-?(?:\d{1,3}(?:[ \u00A0.]\d{3})+|\d+)(?:,\d{1,2})?)(?![\p{L}])/iu;
  var CURRENCY_NAMES4 = {
    "\u20AC": {
      singular: "euro",
      plural: "euros",
      partitivePlural: "d'euros",
      subunitSingular: "centime",
      subunitPlural: "centimes"
    },
    $: {
      singular: "dollar",
      plural: "dollars",
      partitivePlural: "de dollars",
      subunitSingular: "cent",
      subunitPlural: "cents"
    },
    "\xA3": {
      singular: "livre sterling",
      plural: "livres sterling",
      partitivePlural: "de livres sterling",
      subunitSingular: "penny",
      subunitPlural: "pence"
    }
  };
  function normalizeCurrencySymbol(raw) {
    if (raw === "$" || raw === "\xA3") {
      return raw;
    }
    return "\u20AC";
  }
  function rewriteFrFrCurrencyForSynthesis(text) {
    let body = text.trim();
    let negative = false;
    if (body.startsWith("-")) {
      negative = true;
      body = body.slice(1).trim();
    }
    let currencySymbol = null;
    const prefixCurrency = body.match(/^[€$£]/u);
    if (prefixCurrency) {
      currencySymbol = normalizeCurrencySymbol(prefixCurrency[0]);
      body = body.slice(1).trim();
      if (body.startsWith("-")) {
        negative = true;
        body = body.slice(1).trim();
      }
    }
    const suffixCurrency = body.match(/\s?([€$£]|EUR|euros?)$/iu);
    if (suffixCurrency) {
      currencySymbol = currencySymbol ?? normalizeCurrencySymbol(suffixCurrency[1]);
      body = body.slice(0, suffixCurrency.index).trim();
    }
    if (!currencySymbol) {
      return text;
    }
    const currencyNames = CURRENCY_NAMES4[currencySymbol];
    body = body.replace(/[ \u00A0.]/g, "");
    const [wholePart, fractionPart = ""] = body.split(",");
    const whole = Number.parseInt(wholePart, 10);
    if (Number.isNaN(whole)) {
      return text;
    }
    let fraction = 0;
    if (fractionPart) {
      const padded = fractionPart.length === 1 ? `${fractionPart}0` : fractionPart;
      fraction = Number.parseInt(padded, 10);
      if (Number.isNaN(fraction)) {
        return text;
      }
    }
    const parts = [];
    if (whole > 0) {
      const spokenWhole = spellFrInteger2(whole);
      if (!spokenWhole) {
        return text;
      }
      const unit = whole === 1 ? currencyNames.singular : currencyNames.plural;
      const needsElision = /\b(?:millions?|milliards?)$/.test(spokenWhole);
      parts.push(`${spokenWhole} ${needsElision ? currencyNames.partitivePlural : unit}`);
    }
    if (fraction > 0) {
      const spokenFraction = spellFrInteger2(fraction);
      if (!spokenFraction) {
        return text;
      }
      parts.push(
        `${spokenFraction} ${fraction === 1 ? currencyNames.subunitSingular : currencyNames.subunitPlural}`
      );
    }
    if (parts.length === 0) {
      parts.push(`z\xE9ro ${currencyNames.singular}`);
    }
    return `${negative ? "moins " : ""}${parts.join(" et ")}`;
  }
  var FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      id: "system:date",
      label: "Dates",
      description: "Converts day-first dates (dd/mm/yyyy, dd/mm/yy, dd-mm-yyyy, dd-mm-yy) to fully spoken French. Two-digit years resolve against a 1940 cutoff: 00\u201339 are read as 2000\u20132039, 40\u201399 as 1940\u20131999.",
      playgroundSample: "Votre rendez-vous est le 24/06/2021, le 24/06/21, ou le 24-06-41.",
      pattern: FR_FR_DATE_REGEX,
      replacement: rewriteFrFrDateForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads French phone numbers in spoken form. Local 0X numbers are read as five 2-digit groups, using 'z\xE9ro' for any pair that begins with a zero. International '+33' numbers preserve the prefix as 'plus trente-trois' and read the 9 national digits as a single-digit head plus four 2-digit groups; '0033' numbers do the same with 'z\xE9ro z\xE9ro, trente-trois' for the prefix.",
      playgroundSample: "Vous pouvez nous joindre au 01 23 45 67 89, au +33 6 12 34 56 78, ou au 0033 6 60 12 34 56.",
      pattern: FR_FR_PHONE_REGEX,
      replacement: rewriteFrFrPhoneForSynthesis
    },
    {
      id: "system:price",
      label: "Currency",
      description: "Converts \u20AC, $, and \xA3 amounts to spoken French, including the required 'de' before million/milliard amounts ('1 000 000 \u20AC' \u2192 'un million d'euros').",
      playgroundSample: "Le solde est de 1 234,56\u20AC, de \u20AC123,45, ou de $123,45. Investissement: 1 000 000 \u20AC.",
      pattern: FR_FR_CURRENCY_REGEX,
      replacement: rewriteFrFrCurrencyForSynthesis
    },
    {
      label: "Postal codes",
      description: "Reads French postal codes when marked with the voice-only <PostCode> tag emitted by fr-FR response guidance.",
      playgroundSample: "Adresse: 68 rue des Archives, <PostCode>75003</PostCode> Paris.",
      pattern: FR_FR_POSTAL_CODE_REGEX,
      replacement: rewriteFrFrPostalCodeTagForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-FR/synthesis-rewrites/index.ts
  var FR_FR_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "fr-fr:phone-numbers",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Phone numbers"
    },
    {
      id: "system:price",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Currency"
    },
    {
      id: "fr-fr:postal-codes",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Postal codes"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/fr-SN/synthesis-rewrites/index.ts
  var FR_SN_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "fr-sn:phone-numbers",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Phone numbers"
    },
    {
      id: "system:price",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Currency"
    },
    {
      id: "fr-sn:postal-codes",
      rule: FR_FR_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Postal codes"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/id-ID/synthesis-rewrites/rules.ts
  var ID_ID_DIGIT_WORDS = {
    "0": "kosong",
    "1": "satu",
    "2": "dua",
    "3": "tiga",
    "4": "empat",
    "5": "lima",
    "6": "enam",
    "7": "tujuh",
    "8": "delapan",
    "9": "sembilan"
  };
  var ID_ID_MONTH_NAMES = [
    "januari",
    "februari",
    "maret",
    "april",
    "mei",
    "juni",
    "juli",
    "agustus",
    "september",
    "oktober",
    "november",
    "desember"
  ];
  var ID_ID_MONTH_NAME_PATTERN = ID_ID_MONTH_NAMES.join("|");
  var ID_ID_PRE_2000_YEAR_REGEX = new RegExp(
    [
      String.raw`(?<![\p{L}\p{N}])(?:`,
      String.raw`(?:tahun|thn\.?|pada|sejak)\s+19\d{2}`,
      String.raw`|\d{1,2}[/-]\d{1,2}[/-]19\d{2}`,
      String.raw`|\d{1,2}\s+(?:${ID_ID_MONTH_NAME_PATTERN})\s*,?\s+19\d{2}`,
      String.raw`)(?![\p{L}\p{N}])`
    ].join(""),
    "iu"
  );
  var ID_ID_NUMERIC_DATE_MATCH = /^(\d{1,2})[/-](\d{1,2})[/-](19\d{2})$/u;
  var ID_ID_MONTH_NAME_DATE_MATCH = new RegExp(
    String.raw`^(\d{1,2})\s+(${ID_ID_MONTH_NAME_PATTERN})\s*,?\s+(19\d{2})$`,
    "iu"
  );
  var ID_ID_PRE_2000_YEAR_MATCH = /^(.*)(19\d{2})$/u;
  function isValidIdIdDateContext(text) {
    const numericDateMatch = text.match(ID_ID_NUMERIC_DATE_MATCH);
    if (numericDateMatch) {
      const day = Number.parseInt(numericDateMatch[1], 10);
      const month = Number.parseInt(numericDateMatch[2], 10);
      const year = Number.parseInt(numericDateMatch[3], 10);
      return isValidGregorianDate(year, month, day);
    }
    const monthNameDateMatch = text.match(ID_ID_MONTH_NAME_DATE_MATCH);
    if (monthNameDateMatch) {
      const day = Number.parseInt(monthNameDateMatch[1], 10);
      const monthName = monthNameDateMatch[2].toLowerCase();
      const month = ID_ID_MONTH_NAMES.findIndex((candidate) => candidate === monthName) + 1;
      const year = Number.parseInt(monthNameDateMatch[3], 10);
      return isValidGregorianDate(year, month, day);
    }
    return true;
  }
  function rewriteIdIdPre2000YearForSynthesis(text) {
    if (!isValidIdIdDateContext(text)) {
      return text;
    }
    const match = text.match(ID_ID_PRE_2000_YEAR_MATCH);
    if (!match) {
      return text;
    }
    const prefix = match[1];
    const year = match[2];
    if (!prefix || !year) {
      return text;
    }
    const digitWords = [...year.slice(2)].map((digit) => ID_ID_DIGIT_WORDS[digit]);
    if (digitWords.some((word) => word === void 0)) {
      return text;
    }
    return `${prefix}sembilan belas ${digitWords.join(" ")}`;
  }
  var ID_ID_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      label: "Pre-2000 years",
      description: 'Reads contextual 1900-1999 years as Indonesian century-plus-digits, for example "19 Maret 1998" as "19 Maret sembilan belas sembilan delapan".',
      playgroundSample: "Tanggal lahirnya 19 Maret 1998.",
      pattern: ID_ID_PRE_2000_YEAR_REGEX,
      replacement: rewriteIdIdPre2000YearForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/id-ID/synthesis-rewrites/index.ts
  var ID_ID_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "id-id:pre-2000-years",
      rule: ID_ID_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Pre-2000 years"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/nb-NO/synthesis-rewrites/rules.ts
  var NB_NO_DIGIT_WORDS = [
    "null",
    "en",
    "to",
    "tre",
    "fire",
    "fem",
    "seks",
    "sju",
    "\xE5tte",
    "ni"
  ];
  var NB_NO_ONES = {
    1: "ett",
    2: "to",
    3: "tre",
    4: "fire",
    5: "fem",
    6: "seks",
    7: "sju",
    8: "\xE5tte",
    9: "ni"
  };
  var NB_NO_TEENS = {
    10: "ti",
    11: "elleve",
    12: "tolv",
    13: "tretten",
    14: "fjorten",
    15: "femten",
    16: "seksten",
    17: "sytten",
    18: "atten",
    19: "nitten"
  };
  var NB_NO_TENS = {
    2: "tjue",
    3: "tretti",
    4: "f\xF8rti",
    5: "femti",
    6: "seksti",
    7: "sytti",
    8: "\xE5tti",
    9: "nitti"
  };
  function spellNbNoOneToNinetyNine(n) {
    if (n < 1 || n > 99) {
      return null;
    }
    if (n < 10) {
      return NB_NO_DIGIT_WORDS[n];
    }
    if (n < 20) {
      return NB_NO_TEENS[n] ?? null;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const tensWord = NB_NO_TENS[tens];
    if (!tensWord) {
      return null;
    }
    if (ones === 0) {
      return tensWord;
    }
    return `${tensWord}${NB_NO_DIGIT_WORDS[ones]}`;
  }
  function spellDigit3(ch) {
    return NB_NO_DIGIT_WORDS[Number.parseInt(ch, 10)];
  }
  var NB_NO_DATE_REGEX = /\b\d{1,2}\.\d{1,2}\.\d{4}\b/;
  var NB_NO_MONTH_NAMES = [
    "januar",
    "februar",
    "mars",
    "april",
    "mai",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "desember"
  ];
  var NB_NO_ORDINAL_DAYS = [
    "",
    "f\xF8rste",
    "andre",
    "tredje",
    "fjerde",
    "femte",
    "sjette",
    "sjuende",
    "\xE5ttende",
    "niende",
    "tiende",
    "ellevte",
    "tolvte",
    "trettende",
    "fjortende",
    "femtende",
    "sekstende",
    "syttende",
    "attende",
    "nittende",
    "tjuende",
    "tjuef\xF8rste",
    "tjueandre",
    "tjuetredje",
    "tjuefjerde",
    "tjuefemte",
    "tjuesjette",
    "tjuesjuende",
    "tjue\xE5ttende",
    "tjueniende",
    "trettiende",
    "trettif\xF8rste"
  ];
  function spellNbNoYear(year) {
    if (year < 1900 || year > 2099) {
      return null;
    }
    if (year === 2e3) {
      return "to tusen";
    }
    const century = Math.floor(year / 100);
    const remainder = year % 100;
    const centuryWord = century === 19 ? "nitten hundre" : century === 20 ? "to tusen" : null;
    if (!centuryWord) {
      return null;
    }
    if (remainder === 0) {
      return centuryWord;
    }
    const remainderWord = spellNbNoOneToNinetyNine(remainder);
    if (!remainderWord) {
      return null;
    }
    return `${centuryWord} og ${remainderWord}`;
  }
  function rewriteNbNoDateForSynthesis(text) {
    const parts = text.split(".");
    if (parts.length !== 3) {
      return text;
    }
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const year = Number.parseInt(parts[2], 10);
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
      return text;
    }
    if (!isValidGregorianDate(year, month, day)) {
      return text;
    }
    const ordinal = NB_NO_ORDINAL_DAYS[day];
    const monthName = NB_NO_MONTH_NAMES[month - 1];
    const spokenYear = spellNbNoYear(year);
    if (!ordinal || !monthName || !spokenYear) {
      return text;
    }
    return `${ordinal} ${monthName} ${spokenYear}`;
  }
  var NB_NO_PHONE_REGEX = /(?<![\d+])(?<!\+47\s?)[2-9](?:[ -]?\d){7}(?!\d)/;
  function rewriteNbNoPhoneForSynthesis(text) {
    const digits = text.replace(/[ -]/g, "");
    if (digits.length !== 8 || /\D/.test(digits)) {
      return text;
    }
    const groups = [];
    for (let i = 0; i < digits.length; i += 2) {
      groups.push([...digits.slice(i, i + 2)].map(spellDigit3).join(" "));
    }
    return groups.join(", ");
  }
  var NB_NO_POSTCODE_REGEX = /(?<!\d)0\d{3}(?!\d)/;
  function rewriteNbNoPostcodeForSynthesis(text) {
    if (text.length !== 4 || /\D/.test(text)) {
      return text;
    }
    return [...text].map(spellDigit3).join(" ");
  }
  var NB_NO_CURRENCY_REGEX = /(?<!\d)-?(?:\d{1,3}(?:[ .]\d{3})+|\d{1,9})(?:,\d{1,2})?\s?(?:[kK][rR](?![\p{L}])|NOK(?![\p{L}]))/u;
  function rewriteNbNoCurrencyForSynthesis(text) {
    let body = text.trim();
    const negative = body.startsWith("-");
    if (negative) {
      body = body.slice(1).trimStart();
    }
    body = body.replace(/\s?(?:kr|NOK)$/i, "").trim();
    body = body.replace(/[ .]/g, "");
    const [wholePart, fractionPart = ""] = body.split(",");
    const whole = Number.parseInt(wholePart, 10);
    if (Number.isNaN(whole)) {
      return text;
    }
    let fraction = 0;
    if (fractionPart) {
      const padded = fractionPart.length === 1 ? `${fractionPart}0` : fractionPart;
      fraction = Number.parseInt(padded, 10);
      if (Number.isNaN(fraction)) {
        return text;
      }
    }
    const parts = [];
    if (whole > 0) {
      parts.push(`${whole} ${whole === 1 ? "krone" : "kroner"}`);
    }
    if (fraction > 0) {
      parts.push(`${fraction} \xF8re`);
    }
    if (parts.length === 0) {
      parts.push("null kroner");
    }
    return `${negative ? "minus " : ""}${parts.join(" og ")}`;
  }
  var NB_NO_LARGE_NUMBER_REGEX = /(?<!\d\.)\b\d{3,5}\b(?!\.\d)/;
  function smallNorwegianWord(n) {
    return NB_NO_ONES[n] ?? NB_NO_TEENS[n] ?? null;
  }
  function rewriteNbNoLargeNumberForSynthesis(text) {
    const value = Number.parseInt(text, 10);
    if (Number.isNaN(value) || value < 100 || value > 99999) {
      return text;
    }
    const parts = [];
    const thousands = Math.floor(value / 1e3);
    const remainder = value % 1e3;
    const hundreds = Math.floor(remainder / 100);
    const tensOnes = remainder % 100;
    if (thousands > 0) {
      parts.push(`${smallNorwegianWord(thousands) ?? String(thousands)} tusen`);
    }
    if (hundreds > 0) {
      parts.push(`${smallNorwegianWord(hundreds) ?? String(hundreds)} hundre`);
    }
    if (tensOnes > 0) {
      parts.push(`og ${tensOnes}`);
    }
    return parts.join(" ");
  }
  var NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      label: "Dates",
      description: "Converts dates in dd.mm.yyyy format to fully spoken Norwegian.",
      playgroundSample: "Avtalen fornyes 01.01.2021 og utl\xF8per 14.05.2026.",
      pattern: NB_NO_DATE_REGEX,
      replacement: rewriteNbNoDateForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads Norwegian local 8-digit phone numbers in 2-digit groups. International +47 numbers are left untouched.",
      playgroundSample: "Du n\xE5r oss p\xE5 41234567, eller +47 22 00 00 00 fra utlandet.",
      pattern: NB_NO_PHONE_REGEX,
      replacement: rewriteNbNoPhoneForSynthesis
    },
    {
      label: "Postcodes",
      description: "Spells Norwegian 4-digit postal codes digit by digit.",
      playgroundSample: "Er postnummeret 0150?",
      pattern: NB_NO_POSTCODE_REGEX,
      replacement: rewriteNbNoPostcodeForSynthesis
    },
    {
      label: "Currency",
      description: "Converts Norwegian kroner amounts (kr, NOK) to spoken form.",
      playgroundSample: "Saldoen er 1 234,56 kr, og gebyret er 1000 kr.",
      pattern: NB_NO_CURRENCY_REGEX,
      replacement: rewriteNbNoCurrencyForSynthesis
    },
    {
      label: "Large numbers",
      description: "Decomposes 3\u20135 digit numbers into a TTS-friendly '[X tusen] [Y hundre] [og Z]' hybrid form to avoid misstress and dropped 'hundre' on multi-digit numbers.",
      playgroundSample: "Bel\xF8pet er 1590 kroner.",
      pattern: NB_NO_LARGE_NUMBER_REGEX,
      replacement: rewriteNbNoLargeNumberForSynthesis
    },
    {
      label: "SMS acronym",
      description: "Reads 'SMS' as the Norwegian phonetic 'essemess'. Otherwise the TTS spells the individual letters in an English-like cadence.",
      playgroundSample: "Du f\xE5r en bekreftelse via SMS.",
      // Unicode-aware non-letter boundaries (ASCII \b would fire false
      // boundaries adjacent to Norwegian å/ø/æ). The compound form "SMS-en"
      // (with the definite-article suffix) keeps the literal "SMS" because
      // the trailing letter blocks the lookahead — accepted limitation.
      pattern: /(?<![\p{L}])sms(?![\p{L}])/giu,
      replacement: "essemess"
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/nb-NO/synthesis-rewrites/index.ts
  var NB_NO_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "nb-no:dates",
      rule: NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "nb-no:phone-numbers",
      rule: NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Phone numbers"
    },
    {
      id: "nb-no:postcodes",
      rule: NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Postcodes"
    },
    {
      id: "system:price",
      rule: NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Currency"
    },
    {
      id: "nb-no:large-numbers",
      rule: NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Large numbers"
    },
    {
      id: "nb-no:sms-acronym",
      rule: NB_NO_DEFAULT_SYNTHESIS_REWRITE_RULES[5],
      expectedLabel: "SMS acronym"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/sv-SE/synthesis-rewrites/rules.ts
  var SV_SE_DIGIT_WORDS = [
    "noll",
    "ett",
    "tv\xE5",
    "tre",
    "fyra",
    "fem",
    "sex",
    "sju",
    "\xE5tta",
    "nio"
  ];
  var SV_SE_ONES = {
    1: "ett",
    2: "tv\xE5",
    3: "tre",
    4: "fyra",
    5: "fem",
    6: "sex",
    7: "sju",
    8: "\xE5tta",
    9: "nio"
  };
  var SV_SE_TEENS = {
    10: "tio",
    11: "elva",
    12: "tolv",
    13: "tretton",
    14: "fjorton",
    15: "femton",
    16: "sexton",
    17: "sjutton",
    18: "arton",
    19: "nitton"
  };
  var SV_SE_TENS = {
    2: "tjugo",
    3: "trettio",
    4: "fyrtio",
    5: "femtio",
    6: "sextio",
    7: "sjuttio",
    8: "\xE5ttio",
    9: "nittio"
  };
  function spellSvSeOneToNinetyNine(n) {
    if (n < 1 || n > 99) {
      return null;
    }
    if (n < 10) {
      return SV_SE_ONES[n] ?? null;
    }
    if (n < 20) {
      return SV_SE_TEENS[n] ?? null;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const tensWord = SV_SE_TENS[tens];
    if (!tensWord) {
      return null;
    }
    if (ones === 0) {
      return tensWord;
    }
    const onesWord = SV_SE_ONES[ones];
    if (!onesWord) {
      return null;
    }
    return `${tensWord}${onesWord}`;
  }
  function spellDigit4(ch) {
    return SV_SE_DIGIT_WORDS[Number.parseInt(ch, 10)];
  }
  var SV_SE_DATE_REGEX = /\b\d{4}-\d{1,2}-\d{1,2}\b/;
  var SV_SE_MONTH_NAMES = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december"
  ];
  var SV_SE_ORDINAL_DAYS = [
    "",
    "f\xF6rsta",
    "andra",
    "tredje",
    "fj\xE4rde",
    "femte",
    "sj\xE4tte",
    "sjunde",
    "\xE5ttonde",
    "nionde",
    "tionde",
    "elfte",
    "tolfte",
    "trettonde",
    "fjortonde",
    "femtonde",
    "sextonde",
    "sjuttonde",
    "artonde",
    "nittonde",
    "tjugonde",
    "tjugof\xF6rsta",
    "tjugoandra",
    "tjugotredje",
    "tjugofj\xE4rde",
    "tjugofemte",
    "tjugosj\xE4tte",
    "tjugosjunde",
    "tjugo\xE5ttonde",
    "tjugonionde",
    "trettionde",
    "trettiof\xF6rsta"
  ];
  function isValidGregorianDate4(year, month, day) {
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
  function spellSvSeYear(year) {
    if (year < 1900 || year > 2099) {
      return null;
    }
    if (year === 2e3) {
      return "tv\xE5tusen";
    }
    const century = Math.floor(year / 100);
    const remainder = year % 100;
    const centuryWord = century === 19 ? "nittonhundra" : century === 20 ? "tjugohundra" : null;
    if (!centuryWord) {
      return null;
    }
    if (remainder === 0) {
      return centuryWord;
    }
    const remainderWord = spellSvSeOneToNinetyNine(remainder);
    if (!remainderWord) {
      return null;
    }
    return `${centuryWord}${remainderWord}`;
  }
  function rewriteSvSeDateForSynthesis(text) {
    const parts = text.split("-");
    if (parts.length !== 3) {
      return text;
    }
    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10);
    const day = Number.parseInt(parts[2], 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return text;
    }
    if (!isValidGregorianDate4(year, month, day)) {
      return text;
    }
    const ordinal = SV_SE_ORDINAL_DAYS[day];
    const monthName = SV_SE_MONTH_NAMES[month - 1];
    const spokenYear = spellSvSeYear(year);
    if (!ordinal || !monthName || !spokenYear) {
      return text;
    }
    return `den ${ordinal} ${monthName} ${spokenYear}`;
  }
  var SV_SE_POSTCODE_REGEX = /\b\d{3} \d{2}\b/;
  function rewriteSvSePostcodeForSynthesis(text) {
    const digits = text.replace(/\s+/g, "");
    if (digits.length !== 5) {
      return text;
    }
    const firstGroup = [...digits.slice(0, 3)].map(spellDigit4).join(" ");
    const secondGroup = [...digits.slice(3)].map(spellDigit4).join(" ");
    return `${firstGroup}, ${secondGroup}`;
  }
  var SV_SE_CURRENCY_REGEX = /(?<!\d)-?\d{1,3}(?:[ .]\d{3})*(?:,\d{1,2})?\s?(?:kr|SEK)(?![\p{L}])/iu;
  function rewriteSvSeCurrencyForSynthesis(text) {
    let body = text.trim();
    const negative = body.startsWith("-");
    if (negative) {
      body = body.slice(1).trimStart();
    }
    body = body.replace(/\s?(?:kr|SEK)$/i, "").trim();
    body = body.replace(/[ .]/g, "");
    const [wholePart, fractionPart = ""] = body.split(",");
    const whole = Number.parseInt(wholePart, 10);
    if (Number.isNaN(whole)) {
      return text;
    }
    let fraction = 0;
    if (fractionPart) {
      const padded = fractionPart.length === 1 ? `${fractionPart}0` : fractionPart;
      fraction = Number.parseInt(padded, 10);
      if (Number.isNaN(fraction)) {
        return text;
      }
    }
    const parts = [];
    if (whole > 0) {
      parts.push(`${whole} ${whole === 1 ? "krona" : "kronor"}`);
    }
    if (fraction > 0) {
      parts.push(`${fraction} \xF6re`);
    }
    if (parts.length === 0) {
      parts.push("noll kronor");
    }
    return `${negative ? "minus " : ""}${parts.join(" och ")}`;
  }
  var SV_SE_PHONE_REGEX = /(?<!\d)0(?:[ -]?\d){9}(?!\d)/;
  function rewriteSvSePhoneForSynthesis(text) {
    const digits = text.replace(/[ -]/g, "");
    if (digits.length !== 10 || !digits.startsWith("0") || /\D/.test(digits)) {
      return text;
    }
    const groups = [];
    for (let i = 0; i < digits.length; i += 2) {
      groups.push([...digits.slice(i, i + 2)].map(spellDigit4).join(" "));
    }
    return groups.join(", ");
  }
  var SV_SE_LARGE_NUMBER_REGEX = /\b\d{3,5}\b/;
  function smallSwedishWord(n) {
    return SV_SE_ONES[n] ?? SV_SE_TEENS[n] ?? null;
  }
  function rewriteSvSeLargeNumberForSynthesis(text) {
    const value = Number.parseInt(text, 10);
    if (Number.isNaN(value) || value < 100 || value > 99999) {
      return text;
    }
    const parts = [];
    const thousands = Math.floor(value / 1e3);
    const remainder = value % 1e3;
    const hundreds = Math.floor(remainder / 100);
    const tensOnes = remainder % 100;
    if (thousands > 0) {
      parts.push(`${smallSwedishWord(thousands) ?? String(thousands)} tusen`);
    }
    if (hundreds > 0) {
      parts.push(`${smallSwedishWord(hundreds) ?? String(hundreds)} hundra`);
    }
    if (tensOnes > 0) {
      parts.push(String(tensOnes));
    }
    return parts.join(" ");
  }
  var SV_SE_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      id: "system:date",
      label: "Dates",
      description: "Converts dates in yyyy-mm-dd format to fully spoken Swedish.",
      playgroundSample: "Ditt avtal startade 2026-05-14.",
      pattern: SV_SE_DATE_REGEX,
      replacement: rewriteSvSeDateForSynthesis
    },
    {
      label: "Phone numbers",
      description: "Reads Swedish local 10-digit phone numbers (07XXXXXXXX form) in 2-digit groups using 'noll' for zero. International +46 numbers are left untouched.",
      playgroundSample: "Du n\xE5r oss p\xE5 0701234567.",
      pattern: SV_SE_PHONE_REGEX,
      replacement: rewriteSvSePhoneForSynthesis
    },
    {
      label: "Postcodes",
      description: "Spells Swedish postal codes digit by digit in 3+2 groups.",
      playgroundSample: "\xC4r ditt postnummer 113 30?",
      pattern: SV_SE_POSTCODE_REGEX,
      replacement: rewriteSvSePostcodeForSynthesis
    },
    {
      label: "Currency",
      description: "Converts Swedish kronor amounts (kr, SEK) to spoken form.",
      playgroundSample: "Saldot \xE4r 1 234,56 kr.",
      pattern: SV_SE_CURRENCY_REGEX,
      replacement: rewriteSvSeCurrencyForSynthesis
    },
    {
      label: "Large numbers",
      description: "Decomposes 3\u20135 digit numbers into a TTS-friendly '[X tusen] [Y hundra] [Z]' hybrid form to avoid misstress and dropped 'hundra' on multi-digit numbers.",
      playgroundSample: "Beloppet \xE4r 1590 kronor.",
      pattern: SV_SE_LARGE_NUMBER_REGEX,
      replacement: rewriteSvSeLargeNumberForSynthesis
    }
  ];
  function caseAwareReplacement2(replacement) {
    return (match) => {
      if (/^\p{Lu}/u.test(match)) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    };
  }
  var SV_SE_CAMILLA_SYNTHESIS_REWRITE_RULES = [
    {
      label: "'de' / 'dem' as spoken Swedish",
      description: "Reads written 'de' and 'dem' as the colloquial 'dom'. Camilla otherwise stresses the literal letters; spoken Swedish merges both to 'dom'.",
      playgroundSample: "De som vill kan kontakta dem direkt.",
      pattern: /(?<![\p{L}])(de|dem)(?![\p{L}])/giu,
      replacement: caseAwareReplacement2("dom")
    },
    {
      label: "'lade' as spoken Swedish",
      description: "Reads 'lade' (past tense of 'l\xE4gga') as the colloquial 'la'. Written form gets stressed wrong in TTS.",
      playgroundSample: "Jag lade boken p\xE5 bordet.",
      pattern: /(?<![\p{L}])lade(?![\p{L}])/giu,
      replacement: caseAwareReplacement2("la")
    },
    {
      label: "SMS acronym",
      description: "Reads 'SMS' as the Swedish phonetic 'essemess'. Otherwise the TTS spells the individual letters in an English-like cadence.",
      playgroundSample: "Du f\xE5r en bekr\xE4ftelse via SMS.",
      pattern: /(?<![\p{L}])sms(?![\p{L}])/giu,
      replacement: "essemess"
    },
    {
      label: "'.se' TLD",
      description: "Reads the Swedish '.se' top-level domain as 'punkt s e' rather than letting the TTS swallow the dot.",
      playgroundSample: "Bes\xF6k oss p\xE5 sierra.se f\xF6r mer information.",
      pattern: /(?<=[\p{L}\p{N}])\.se(?![\p{L}])/gu,
      replacement: " punkt s e"
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/sv-SE/synthesis-rewrites/index.ts
  var SV_SE_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "system:date",
      rule: SV_SE_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Dates"
    },
    {
      id: "sv-se:phone-numbers",
      rule: SV_SE_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Phone numbers"
    },
    {
      id: "sv-se:postcodes",
      rule: SV_SE_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Postcodes"
    },
    {
      id: "sv-se:currency",
      rule: SV_SE_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Currency"
    },
    {
      id: "sv-se:large-numbers",
      rule: SV_SE_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Large numbers"
    },
    {
      id: "sv-se:camilla-de-dem-as-spoken-swedish",
      rule: SV_SE_CAMILLA_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "'de' / 'dem' as spoken Swedish"
    },
    {
      id: "sv-se:camilla-lade-as-spoken-swedish",
      rule: SV_SE_CAMILLA_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "'lade' as spoken Swedish"
    },
    {
      id: "sv-se:camilla-sms-acronym",
      rule: SV_SE_CAMILLA_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "SMS acronym"
    },
    {
      id: "sv-se:camilla-se-tld",
      rule: SV_SE_CAMILLA_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "'.se' TLD"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/th-TH/synthesis-rewrites/rules.ts
  var THAI_NUMERIC_DATE_REGEX = /(?<![\p{L}\p{N}])(?:[0-9๐-๙]{1,2}[/-][0-9๐-๙]{1,2}[/-][0-9๐-๙]{2}(?:[0-9๐-๙]{2})?)(?![\p{L}\p{N}])/u;
  var THAI_BAHT_AMOUNT_REGEX = /(?<![\p{L}\p{N}])(?:฿\s*[0-9๐-๙][0-9๐-๙,]*(?:\.[0-9๐-๙]{1,2})?|(?:THB|บาท)\s*[0-9๐-๙][0-9๐-๙,]*(?:\.[0-9๐-๙]{1,2})?|[0-9๐-๙][0-9๐-๙,]*(?:\.[0-9๐-๙]{1,2})?\s*(?:บาท|THB))(?![\p{L}\p{N}])/iu;
  var LONG_DIGIT_SEQUENCE_REGEX = /(?<![\p{L}\p{N}])(?:[0-9๐-๙][ -]?){4,}[0-9๐-๙](?![\p{L}\p{N}])/u;
  var THAI_DIGIT_WORDS = [
    "\u0E28\u0E39\u0E19\u0E22\u0E4C",
    "\u0E2B\u0E19\u0E36\u0E48\u0E07",
    "\u0E2A\u0E2D\u0E07",
    "\u0E2A\u0E32\u0E21",
    "\u0E2A\u0E35\u0E48",
    "\u0E2B\u0E49\u0E32",
    "\u0E2B\u0E01",
    "\u0E40\u0E08\u0E47\u0E14",
    "\u0E41\u0E1B\u0E14",
    "\u0E40\u0E01\u0E49\u0E32"
  ];
  var THAI_NUMBER_UNITS = ["", "\u0E2A\u0E34\u0E1A", "\u0E23\u0E49\u0E2D\u0E22", "\u0E1E\u0E31\u0E19", "\u0E2B\u0E21\u0E37\u0E48\u0E19", "\u0E41\u0E2A\u0E19"];
  var THAI_MONTH_NAMES = [
    "\u0E21\u0E01\u0E23\u0E32\u0E04\u0E21",
    "\u0E01\u0E38\u0E21\u0E20\u0E32\u0E1E\u0E31\u0E19\u0E18\u0E4C",
    "\u0E21\u0E35\u0E19\u0E32\u0E04\u0E21",
    "\u0E40\u0E21\u0E29\u0E32\u0E22\u0E19",
    "\u0E1E\u0E24\u0E29\u0E20\u0E32\u0E04\u0E21",
    "\u0E21\u0E34\u0E16\u0E38\u0E19\u0E32\u0E22\u0E19",
    "\u0E01\u0E23\u0E01\u0E0E\u0E32\u0E04\u0E21",
    "\u0E2A\u0E34\u0E07\u0E2B\u0E32\u0E04\u0E21",
    "\u0E01\u0E31\u0E19\u0E22\u0E32\u0E22\u0E19",
    "\u0E15\u0E38\u0E25\u0E32\u0E04\u0E21",
    "\u0E1E\u0E24\u0E28\u0E08\u0E34\u0E01\u0E32\u0E22\u0E19",
    "\u0E18\u0E31\u0E19\u0E27\u0E32\u0E04\u0E21"
  ];
  var THAI_NUMERAL_OFFSET = "\u0E50".charCodeAt(0);
  function normalizeThaiNumerals(text) {
    return text.replace(
      /[๐-๙]/g,
      (digit) => String.fromCharCode("0".charCodeAt(0) + digit.charCodeAt(0) - THAI_NUMERAL_OFFSET)
    );
  }
  function parseThaiNumber(value) {
    return Number.parseInt(normalizeThaiNumerals(value), 10);
  }
  function spellThaiNumberBelowMillion(value) {
    if (!Number.isInteger(value) || value < 0 || value >= 1e6) {
      return null;
    }
    if (value === 0) {
      return THAI_DIGIT_WORDS[0];
    }
    const digits = String(value).split("").map(Number);
    const parts = [];
    for (const [index, digit] of digits.entries()) {
      if (digit === 0) {
        continue;
      }
      const position = digits.length - index - 1;
      if (position === 0) {
        parts.push(digit === 1 && value > 10 ? "\u0E40\u0E2D\u0E47\u0E14" : THAI_DIGIT_WORDS[digit]);
      } else if (position === 1) {
        if (digit === 1) {
          parts.push("\u0E2A\u0E34\u0E1A");
        } else if (digit === 2) {
          parts.push("\u0E22\u0E35\u0E48\u0E2A\u0E34\u0E1A");
        } else {
          parts.push(`${THAI_DIGIT_WORDS[digit]}\u0E2A\u0E34\u0E1A`);
        }
      } else {
        parts.push(`${THAI_DIGIT_WORDS[digit]}${THAI_NUMBER_UNITS[position]}`);
      }
    }
    return parts.join("");
  }
  function spellThaiInteger(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
      return null;
    }
    if (value < 1e6) {
      return spellThaiNumberBelowMillion(value);
    }
    const millions = Math.floor(value / 1e6);
    const remainder = value % 1e6;
    const millionWords = spellThaiInteger(millions);
    const remainderWords = remainder > 0 ? spellThaiNumberBelowMillion(remainder) : "";
    return millionWords ? `${millionWords}\u0E25\u0E49\u0E32\u0E19${remainderWords}` : null;
  }
  function spellThaiDay(day) {
    if (day < 1 || day > 31) {
      return null;
    }
    if (day === 1) {
      return THAI_DIGIT_WORDS[1];
    }
    return spellThaiInteger(day);
  }
  function resolveThaiCalendarYear(yearPart) {
    const normalizedYear = normalizeThaiNumerals(yearPart);
    const rawYear = Number.parseInt(normalizedYear, 10);
    if (Number.isNaN(rawYear)) {
      return null;
    }
    if (normalizedYear.length === 2) {
      const buddhistYear = rawYear >= 43 ? 2500 + rawYear : 2543 + rawYear;
      return { buddhistYear, isoYear: buddhistYear - 543 };
    }
    if (rawYear >= 2400 && rawYear <= 2700) {
      return { buddhistYear: rawYear, isoYear: rawYear - 543 };
    }
    if (rawYear >= 1900 && rawYear <= 2399) {
      return { buddhistYear: rawYear + 543, isoYear: rawYear };
    }
    return null;
  }
  function rewriteThaiDateForSynthesis(text) {
    const separator = text.includes("/") ? "/" : text.includes("-") ? "-" : null;
    if (!separator) {
      return text;
    }
    const [firstPart, secondPart, yearPart] = text.split(separator);
    const firstValue = parseThaiNumber(firstPart);
    const secondValue = parseThaiNumber(secondPart);
    const resolvedYear = resolveThaiCalendarYear(yearPart);
    if (Number.isNaN(firstValue) || Number.isNaN(secondValue) || !resolvedYear) {
      return text;
    }
    const dayMonthYear = isValidGregorianDate(resolvedYear.isoYear, secondValue, firstValue) ? { day: firstValue, month: secondValue } : isValidGregorianDate(resolvedYear.isoYear, firstValue, secondValue) ? { day: secondValue, month: firstValue } : null;
    if (!dayMonthYear) {
      return text;
    }
    const spokenDay = spellThaiDay(dayMonthYear.day);
    const spokenYear = spellThaiInteger(resolvedYear.buddhistYear);
    const spokenMonth = THAI_MONTH_NAMES[dayMonthYear.month - 1];
    if (!spokenDay || !spokenYear) {
      return text;
    }
    return `\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48${spokenDay} ${spokenMonth} \u0E1E.\u0E28. ${spokenYear}`;
  }
  function parseThaiBahtAmount(text) {
    const normalized = normalizeThaiNumerals(text).replace(/THB/gi, "").replace(/฿|บาท/g, "").replace(/\s+/g, "").replace(/,/g, "");
    const match = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/);
    if (!match) {
      return null;
    }
    const baht = Number.parseInt(match[1], 10);
    const satang = match[2] ? Number.parseInt(match[2].padEnd(2, "0"), 10) : 0;
    if (!Number.isSafeInteger(baht) || baht < 0 || satang < 0 || satang > 99) {
      return null;
    }
    return { baht, satang };
  }
  function rewriteThaiBahtForSynthesis(text) {
    const amount = parseThaiBahtAmount(text);
    if (!amount) {
      return text;
    }
    const bahtWords = spellThaiInteger(amount.baht);
    const satangWords = amount.satang > 0 ? spellThaiInteger(amount.satang) : null;
    if (!bahtWords || amount.satang > 0 && !satangWords) {
      return text;
    }
    return amount.satang > 0 ? `${bahtWords}\u0E1A\u0E32\u0E17${satangWords}\u0E2A\u0E15\u0E32\u0E07\u0E04\u0E4C` : `${bahtWords}\u0E1A\u0E32\u0E17\u0E16\u0E49\u0E27\u0E19`;
  }
  function rewriteThaiDigitSequenceForSynthesis(text) {
    const digitWords = normalizeThaiNumerals(text).match(/[0-9]/g)?.map((digit) => THAI_DIGIT_WORDS[Number.parseInt(digit, 10)]);
    return digitWords && digitWords.length > 0 ? digitWords.join(" ") : text;
  }
  var TH_TH_DEFAULT_SYNTHESIS_REWRITE_RULES = [
    {
      label: "Date normalization",
      description: "Converts Thai numeric dates into spoken Thai, assuming DD/MM/YYYY and Buddhist Era year numbering. Falls back to MM/DD/YYYY if only valid option.",
      playgroundSample: "\u0E01\u0E32\u0E23\u0E19\u0E31\u0E14\u0E2B\u0E21\u0E32\u0E22\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E04\u0E37\u0E2D\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 04/02/2026.",
      pattern: THAI_NUMERIC_DATE_REGEX,
      replacement: rewriteThaiDateForSynthesis
    },
    {
      label: "Thai baht normalization",
      description: "Converts Thai baht amounts into fully spoken Thai baht and satang.",
      playgroundSample: "\u0E22\u0E2D\u0E14\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E0A\u0E33\u0E23\u0E30\u0E04\u0E37\u0E2D \u0E3F1,234.50.",
      pattern: THAI_BAHT_AMOUNT_REGEX,
      replacement: rewriteThaiBahtForSynthesis
    },
    {
      label: "Digit sequence normalization",
      description: "Reads long confirmation numbers, phone numbers, and other IDs digit by digit.",
      playgroundSample: "\u0E23\u0E2B\u0E31\u0E2A\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E04\u0E37\u0E2D 12345.",
      pattern: LONG_DIGIT_SEQUENCE_REGEX,
      replacement: rewriteThaiDigitSequenceForSynthesis
    }
  ];

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/th-TH/synthesis-rewrites/index.ts
  var TH_TH_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "th-th:date-normalization",
      rule: TH_TH_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "Date normalization"
    },
    {
      id: "th-th:thai-baht-normalization",
      rule: TH_TH_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "Thai baht normalization"
    },
    {
      id: "th-th:digit-sequence-normalization",
      rule: TH_TH_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "Digit sequence normalization"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/common/synthesis-rewrites/chinese.ts
  var DIGIT_WORDS5 = {
    "0": "\u96F6",
    "1": "\u4E00",
    "2": "\u4E8C",
    "3": "\u4E09",
    "4": "\u56DB",
    "5": "\u4E94",
    "6": "\u516D",
    "7": "\u4E03",
    "8": "\u516B",
    "9": "\u4E5D"
  };
  var MAX_SPOKEN_AMOUNT = 1e8;
  var RMB_DENOMINATIONS = {
    dollar: "\u5143",
    tenCent: "\u89D2",
    cent: "\u5206",
    zeroOnly: "\u96F6\u5143"
  };
  var ZH_MANDARIN_SIMPLIFIED = {
    dialectName: "Mandarin",
    tenThousand: "\u4E07",
    internationalCallPrefix: "\u56FD\u9645\u533A\u53F7",
    hkdPrefix: "\u6E2F\u5E01",
    rmbPrefix: "\u4EBA\u6C11\u5E01",
    hkdDenominations: RMB_DENOMINATIONS,
    samples: {
      hkdCurrency: "\u60A8\u7684\u8D26\u6237\u4F59\u989D\u662F HKD 1,234.56\u3002",
      rmbCurrency: "\u60A8\u7684\u8D26\u6237\u4F59\u989D\u662F RMB 1,234.56\u3002",
      idAcronym: "\u8BF7\u51FA\u793A\u60A8\u7684ID\u3002",
      hkPhone: "\u8BF7\u81F4\u7535 9123 4567 \u67E5\u8BE2\u8BE6\u60C5\u3002",
      mainlandPhone: "\u8BF7\u81F4\u7535 138 1234 5678 \u67E5\u8BE2\u8BE6\u60C5\u3002",
      dayFirstDate: "\u60A8\u7684\u5361\u5230\u671F\u65E5\u662F 31/12/2026\u3002",
      yearFirstDate: "\u60A8\u7684\u5361\u5230\u671F\u65E5\u662F 2026-12-31\u3002"
    }
  };
  var ZH_CANTONESE_TRADITIONAL = {
    dialectName: "Cantonese",
    tenThousand: "\u842C",
    internationalCallPrefix: "\u570B\u969B\u5340\u865F",
    hkdPrefix: "\u6E2F\u5E63",
    rmbPrefix: "\u4EBA\u6C11\u5E63",
    hkdDenominations: { dollar: "\u868A", tenCent: "\u6BEB", cent: "\u4ED9", zeroOnly: "\u96F6\u868A" },
    samples: {
      hkdCurrency: "\u6236\u53E3\u7D50\u9918\u4FC2 HKD 1,234.56\u3002",
      rmbCurrency: "\u6236\u53E3\u7D50\u9918\u4FC2 RMB 1,234.56\u3002",
      idAcronym: "\u8ACB\u51FA\u793A\u4F60\u5605ID\u3002",
      hkPhone: "\u8ACB\u81F4\u96FB 9123 4567 \u67E5\u8A62\u8A73\u60C5\u3002",
      mainlandPhone: "\u8ACB\u81F4\u96FB 138 1234 5678 \u67E5\u8A62\u8A73\u60C5\u3002",
      dayFirstDate: "\u4F60\u5605\u5361\u5230\u671F\u65E5\u4FC2 31/12/2026\u3002",
      yearFirstDate: "\u4F60\u5605\u5361\u5230\u671F\u65E5\u4FC2 2026-12-31\u3002"
    }
  };
  var HKD_CURRENCY_REGEX = /(?:HKD|HK\$)\s*(?:(?:\d{1,3}(?:(?:,\d{3})+|\d*)(?:\.\d{1,2})?)|(?:\.\d{1,2}))(?![\d,.])/i;
  var RMB_CURRENCY_REGEX = /(?:RMB|CNY|￥|¥)\s*(?:(?:\d{1,3}(?:(?:,\d{3})+|\d*)(?:\.\d{1,2})?)|(?:\.\d{1,2}))(?![\d,.])/i;
  var HK_PHONE_REGEX = /(?<!\d)(?:\+?852[ -]?)?[2-9]\d{3}[ -]?\d{4}(?!\d)/;
  var MAINLAND_PHONE_REGEX = /(?<!\d)(?:\+?86[ -]?)?1[3-9]\d[ -]?\d{4}[ -]?\d{4}(?!\d)/;
  var DAYFIRST_DATE_REGEX = /\b\d{1,2}[/-]\d{1,2}[/-](?:\d{4}|\d{2})\b/;
  var YEARFIRST_DATE_REGEX = /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/;
  function spellDigits(group) {
    return [...group].map((d) => DIGIT_WORDS5[d] ?? d).join("");
  }
  function spellUnder10k(n, inSubPosition = false) {
    if (n === 0) {
      return "";
    }
    if (n < 10) {
      return DIGIT_WORDS5[n.toString()];
    }
    if (n < 20) {
      const tensWord = inSubPosition ? "\u4E00\u5341" : "\u5341";
      return n === 10 ? tensWord : `${tensWord}${DIGIT_WORDS5[(n - 10).toString()]}`;
    }
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      const head2 = `${DIGIT_WORDS5[tens.toString()]}\u5341`;
      return ones === 0 ? head2 : `${head2}${DIGIT_WORDS5[ones.toString()]}`;
    }
    if (n < 1e3) {
      const hundreds = Math.floor(n / 100);
      const rest2 = n % 100;
      const head2 = `${DIGIT_WORDS5[hundreds.toString()]}\u767E`;
      if (rest2 === 0) {
        return head2;
      }
      if (rest2 < 10) {
        return `${head2}\u96F6${spellUnder10k(rest2, true)}`;
      }
      return `${head2}${spellUnder10k(rest2, true)}`;
    }
    const thousands = Math.floor(n / 1e3);
    const rest = n % 1e3;
    const head = `${DIGIT_WORDS5[thousands.toString()]}\u5343`;
    if (rest === 0) {
      return head;
    }
    if (rest < 100) {
      return `${head}\u96F6${spellUnder10k(rest, true)}`;
    }
    return `${head}${spellUnder10k(rest, true)}`;
  }
  function spellInteger(n, tenThousand) {
    if (n === 0) {
      return "\u96F6";
    }
    if (n < 1e4) {
      return spellUnder10k(n);
    }
    const wan = Math.floor(n / 1e4);
    const rest = n % 1e4;
    const head = `${spellInteger(wan, tenThousand)}${tenThousand}`;
    if (rest === 0) {
      return head;
    }
    if (rest < 1e3) {
      return `${head}\u96F6${spellUnder10k(rest, true)}`;
    }
    return `${head}${spellUnder10k(rest, true)}`;
  }
  function spellNumberBelow1002(n) {
    if (n < 0 || n > 99) {
      return n.toString();
    }
    if (n === 0) {
      return "\u96F6";
    }
    if (n < 10) {
      return DIGIT_WORDS5[n.toString()];
    }
    if (n === 10) {
      return "\u5341";
    }
    if (n < 20) {
      return `\u5341${DIGIT_WORDS5[(n - 10).toString()]}`;
    }
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const tensWord = `${DIGIT_WORDS5[tens.toString()]}\u5341`;
    return ones === 0 ? tensWord : `${tensWord}${DIGIT_WORDS5[ones.toString()]}`;
  }
  function spellAmount(intPart, cents, dialect, denoms) {
    const parts = [];
    if (intPart > 0) {
      parts.push(`${spellInteger(intPart, dialect.tenThousand)}${denoms.dollar}`);
    }
    if (cents > 0) {
      const tens = Math.floor(cents / 10);
      const ones = cents % 10;
      if (tens > 0) {
        parts.push(`${DIGIT_WORDS5[tens.toString()]}${denoms.tenCent}`);
      } else if (intPart > 0) {
        parts.push("\u96F6");
      }
      if (ones > 0) {
        parts.push(`${DIGIT_WORDS5[ones.toString()]}${denoms.cent}`);
      }
    }
    if (parts.length === 0) {
      return denoms.zeroOnly;
    }
    return parts.join("");
  }
  function parseAmount(numeric) {
    const dotIdx = numeric.indexOf(".");
    const integerPartStr = dotIdx === -1 ? numeric : numeric.slice(0, dotIdx);
    const integerPart = integerPartStr === "" ? 0 : Number.parseInt(integerPartStr, 10);
    if (Number.isNaN(integerPart) || integerPart >= MAX_SPOKEN_AMOUNT) {
      return null;
    }
    let decimalCents = 0;
    if (dotIdx !== -1) {
      const decimalStr = numeric.slice(dotIdx + 1).padEnd(2, "0").slice(0, 2);
      decimalCents = Number.parseInt(decimalStr, 10);
      if (Number.isNaN(decimalCents)) {
        return null;
      }
    }
    return { integerPart, decimalCents };
  }
  function spellGregorianDate(year, month, day) {
    const yearSpoken = year.toString().split("").map((d) => DIGIT_WORDS5[d]).join("");
    const monthSpoken = spellNumberBelow1002(month);
    const daySpoken = spellNumberBelow1002(day);
    return `${yearSpoken}\u5E74${monthSpoken}\u6708${daySpoken}\u65E5`;
  }
  function rewriteHkd(text, dialect) {
    const numeric = text.replace(/^(?:HKD|HK\$)\s*/i, "").replace(/,/g, "");
    const parsed = parseAmount(numeric);
    if (parsed === null) {
      return text;
    }
    return `${dialect.hkdPrefix}${spellAmount(parsed.integerPart, parsed.decimalCents, dialect, dialect.hkdDenominations)}`;
  }
  function rewriteRmb(text, dialect) {
    const numeric = text.replace(/^(?:RMB|CNY|￥|¥)\s*/i, "").replace(/,/g, "");
    const parsed = parseAmount(numeric);
    if (parsed === null) {
      return text;
    }
    return `${dialect.rmbPrefix}${spellAmount(parsed.integerPart, parsed.decimalCents, dialect, RMB_DENOMINATIONS)}`;
  }
  function rewriteHkPhone(text, dialect) {
    const normalized = text.replace(/[ +-]/g, "");
    const hasCountryCode = normalized.length === 11 && normalized.startsWith("852");
    const trimmed = hasCountryCode ? normalized.slice(3) : normalized;
    if (trimmed.length !== 8 || !/^\d+$/.test(trimmed)) {
      return text;
    }
    const left = spellDigits(trimmed.slice(0, 4));
    const right = spellDigits(trimmed.slice(4, 8));
    return hasCountryCode ? `${dialect.internationalCallPrefix}\u516B\u4E94\u4E8C\uFF0C${left}\uFF0C${right}` : `${left}\uFF0C${right}`;
  }
  function rewriteMainlandPhone(text, dialect) {
    const normalized = text.replace(/[ +-]/g, "");
    const hasCountryCode = normalized.length === 13 && normalized.startsWith("86");
    const trimmed = hasCountryCode ? normalized.slice(2) : normalized;
    if (trimmed.length !== 11 || !/^1[3-9]\d{9}$/.test(trimmed)) {
      return text;
    }
    const head = spellDigits(trimmed.slice(0, 3));
    const mid = spellDigits(trimmed.slice(3, 7));
    const tail = spellDigits(trimmed.slice(7, 11));
    return hasCountryCode ? `${dialect.internationalCallPrefix}\u516B\u516D\uFF0C${head}\uFF0C${mid}\uFF0C${tail}` : `${head}\uFF0C${mid}\uFF0C${tail}`;
  }
  function rewriteDayFirstDate(text) {
    const separator = text.includes("/") ? "/" : "-";
    const [firstStr, secondStr, yearStr] = text.split(separator);
    const firstValue = Number.parseInt(firstStr, 10);
    const secondValue = Number.parseInt(secondStr, 10);
    const rawYear = Number.parseInt(yearStr, 10);
    if (Number.isNaN(firstValue) || Number.isNaN(secondValue) || Number.isNaN(rawYear)) {
      return text;
    }
    const year = yearStr.length === 2 ? rawYear < 30 ? 2e3 + rawYear : 1900 + rawYear : rawYear;
    if (year < 1900 || year > 2099) {
      return text;
    }
    const dayMonth = isValidGregorianDate(year, secondValue, firstValue) ? { day: firstValue, month: secondValue } : isValidGregorianDate(year, firstValue, secondValue) ? { day: secondValue, month: firstValue } : null;
    if (!dayMonth) {
      return text;
    }
    return spellGregorianDate(year, dayMonth.month, dayMonth.day);
  }
  function rewriteYearFirstDate(text) {
    const separator = text.includes("/") ? "/" : "-";
    const [yearStr, monthStr, dayStr] = text.split(separator);
    const year = Number.parseInt(yearStr, 10);
    const month = Number.parseInt(monthStr, 10);
    const day = Number.parseInt(dayStr, 10);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return text;
    }
    if (year < 1900 || year > 2099 || !isValidGregorianDate(year, month, day)) {
      return text;
    }
    return spellGregorianDate(year, month, day);
  }
  function createZhSynthesisRules(dialect) {
    return [
      {
        label: "HKD currency",
        description: `Replaces HKD/HK$ prefix with ${dialect.hkdPrefix} so ${dialect.dialectName} TTS reads the symbol naturally.`,
        playgroundSample: dialect.samples.hkdCurrency,
        pattern: HKD_CURRENCY_REGEX,
        replacement: (t) => rewriteHkd(t, dialect)
      },
      {
        label: "RMB currency",
        description: `Replaces RMB / CNY / \xA5 prefix with ${dialect.rmbPrefix} so ${dialect.dialectName} TTS reads the symbol naturally. RMB amounts always use formal denominations \u5143/\u89D2/\u5206.`,
        playgroundSample: dialect.samples.rmbCurrency,
        pattern: RMB_CURRENCY_REGEX,
        replacement: (t) => rewriteRmb(t, dialect)
      },
      {
        label: "ID acronym",
        description: `Spells out the standalone acronym 'ID' so ${dialect.dialectName} TTS doesn't read it as a Chinese character.`,
        playgroundSample: dialect.samples.idAcronym,
        pattern: /\bID\b/,
        replacement: "I D"
      },
      {
        label: "Hong Kong phone numbers",
        description: `Reads 8-digit Hong Kong phone numbers digit-by-digit in 4-4 blocks (${dialect.dialectName} digits).`,
        playgroundSample: dialect.samples.hkPhone,
        pattern: HK_PHONE_REGEX,
        replacement: (t) => rewriteHkPhone(t, dialect)
      },
      {
        label: "Mainland phone numbers",
        description: `Reads 11-digit Mainland China mobile numbers digit-by-digit in 3-4-4 blocks (${dialect.dialectName} digits), with optional +86 country code.`,
        playgroundSample: dialect.samples.mainlandPhone,
        pattern: MAINLAND_PHONE_REGEX,
        replacement: (t) => rewriteMainlandPhone(t, dialect)
      },
      {
        // Overrides the global `system:date` rule. Without this override,
        // the system rule's dash-form alternative — which only anchors `\b`
        // at the end — would match `26-12-31` inside `2026-12-31`,
        // splitting the chunk before our year-first rewriter sees the
        // leading `2026`.
        id: "system:date",
        label: "Year-first dates",
        description: "Converts yyyy-mm-dd / yyyy/mm/dd (Mainland and ISO convention) to spoken Chinese date (\u5E74\u6708\u65E5).",
        playgroundSample: dialect.samples.yearFirstDate,
        pattern: YEARFIRST_DATE_REGEX,
        replacement: rewriteYearFirstDate
      },
      {
        label: "Day-first dates",
        description: "Converts dd/mm/yyyy to spoken Chinese date (\u5E74\u6708\u65E5).",
        playgroundSample: dialect.samples.dayFirstDate,
        pattern: DAYFIRST_DATE_REGEX,
        replacement: rewriteDayFirstDate
      }
    ];
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zh-CN/synthesis-rewrites/rules.ts
  var ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES = createZhSynthesisRules(ZH_MANDARIN_SIMPLIFIED);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zh-CN/synthesis-rewrites/index.ts
  var ZH_CN_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "zh-cn:hkd-currency",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "HKD currency"
    },
    {
      id: "zh-cn:rmb-currency",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "RMB currency"
    },
    {
      id: "zh-cn:id-acronym",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "ID acronym"
    },
    {
      id: "zh-cn:hong-kong-phone-numbers",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Hong Kong phone numbers"
    },
    {
      id: "zh-cn:mainland-phone-numbers",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Mainland phone numbers"
    },
    {
      id: "system:date",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[5],
      expectedLabel: "Year-first dates"
    },
    {
      id: "zh-cn:day-first-dates",
      rule: ZH_CN_DEFAULT_SYNTHESIS_REWRITE_RULES[6],
      expectedLabel: "Day-first dates"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zh-HK/synthesis-rewrites/rules.ts
  var ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES = createZhSynthesisRules(ZH_CANTONESE_TRADITIONAL);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/zh-HK/synthesis-rewrites/index.ts
  var ZH_HK_SYNTHESIS_REWRITE_RULES = defineLocaleSynthesisRewriteRules([
    {
      id: "zh-hk:hkd-currency",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[0],
      expectedLabel: "HKD currency"
    },
    {
      id: "zh-hk:rmb-currency",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[1],
      expectedLabel: "RMB currency"
    },
    {
      id: "zh-hk:id-acronym",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[2],
      expectedLabel: "ID acronym"
    },
    {
      id: "zh-hk:hong-kong-phone-numbers",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[3],
      expectedLabel: "Hong Kong phone numbers"
    },
    {
      id: "zh-hk:mainland-phone-numbers",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[4],
      expectedLabel: "Mainland phone numbers"
    },
    {
      id: "system:date",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[5],
      expectedLabel: "Year-first dates"
    },
    {
      id: "zh-hk:day-first-dates",
      rule: ZH_HK_DEFAULT_SYNTHESIS_REWRITE_RULES[6],
      expectedLabel: "Day-first dates"
    }
  ]);

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/locale-defaults/synthesis-rewrites-registry.ts
  var SYNTHESIS_REWRITE_RULES_BY_LOCALE = {
    "ar-AE": AR_AE_SYNTHESIS_REWRITE_RULES,
    "de-DE": DE_DE_SYNTHESIS_REWRITE_RULES,
    "en-AU": EN_AU_SYNTHESIS_REWRITE_RULES,
    "en-GB": EN_GB_SYNTHESIS_REWRITE_RULES,
    "en-ID": EN_ID_SYNTHESIS_REWRITE_RULES,
    "en-IE": EN_IE_SYNTHESIS_REWRITE_RULES,
    "en-NZ": EN_NZ_SYNTHESIS_REWRITE_RULES,
    "en-SG": EN_SG_SYNTHESIS_REWRITE_RULES,
    "en-US": EN_US_SYNTHESIS_REWRITE_RULES,
    "en-ZA": EN_ZA_SYNTHESIS_REWRITE_RULES,
    "es-AR": ES_AR_SYNTHESIS_REWRITE_RULES,
    "es-ES": ES_ES_SYNTHESIS_REWRITE_RULES,
    "fi-FI": FI_FI_SYNTHESIS_REWRITE_RULES,
    "fr-CA": FR_CA_SYNTHESIS_REWRITE_RULES,
    "fr-FR": FR_FR_SYNTHESIS_REWRITE_RULES,
    "fr-SN": FR_SN_SYNTHESIS_REWRITE_RULES,
    "id-ID": ID_ID_SYNTHESIS_REWRITE_RULES,
    "nb-NO": NB_NO_SYNTHESIS_REWRITE_RULES,
    "sv-SE": SV_SE_SYNTHESIS_REWRITE_RULES,
    "th-TH": TH_TH_SYNTHESIS_REWRITE_RULES,
    "zh-CN": ZH_CN_SYNTHESIS_REWRITE_RULES,
    "zh-HK": ZH_HK_SYNTHESIS_REWRITE_RULES
  };
  var SYNTHESIS_REWRITE_RULES_BY_LOWER_LOCALE = new Map(
    Object.entries(SYNTHESIS_REWRITE_RULES_BY_LOCALE).map(([locale, rules]) => [
      locale.toLowerCase(),
      rules
    ])
  );
  function rulesForLocale(locale) {
    return locale ? SYNTHESIS_REWRITE_RULES_BY_LOWER_LOCALE.get(locale.toLowerCase()) ?? [] : [];
  }
  function getDefaultSynthesisRewriteRuleMetadataForLocale(locale) {
    return rulesForLocale(locale).map((rule) => ({
      id: rule.id,
      label: rule.label ?? rule.id,
      ...rule.description !== void 0 ? { description: rule.description } : {},
      ...rule.playgroundSample !== void 0 ? { playgroundSample: rule.playgroundSample } : {}
    }));
  }

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/base.ts
  var SIERRA_SDK_NAMESPACE = "sdk";
  var MAX_POST_CONVERSATION_DELAY_SECONDS = 30 * 24 * 60 * 60;
  var MAX_TRAILING_SILENCE_MS = 3e4;
  var MAX_INITIAL_DELAY_MS = 3e4;
  var MAX_INACTIVITY_TIMEOUT_SECONDS = 600;
  var MAX_INACTIVITY_COUNT = 20;
  var MAX_ADAPTIVE_WAIT_SECONDS = 900;
  var LOCALIZED_DEFAULTS = [];
  for (const [code, defaults] of Object.entries(SUPPORTED_LOCALE_DEFAULTS)) {
    if (isLocaleDefaultsByVariant(defaults)) {
      LOCALIZED_DEFAULTS.push([`${code}-feminine`, code, defaults.feminine]);
      LOCALIZED_DEFAULTS.push([`${code}-masculine`, code, defaults.masculine]);
    } else {
      LOCALIZED_DEFAULTS.push([code, code, defaults]);
    }
  }
  function projectLocaleDefaults(defaults, fieldToKey) {
    return Object.fromEntries(
      Object.entries(fieldToKey).map(([field, key]) => [field, defaults[key]])
    );
  }
  function perLocaleDefaults(fieldToKey) {
    const out = {};
    for (const [variantKey, , defaults] of LOCALIZED_DEFAULTS) {
      out[variantKey] = projectLocaleDefaults(defaults, fieldToKey);
    }
    return out;
  }
  function abuseConfigPerLocaleDefaults() {
    const configDefaults = (defaults) => ({
      globalMode: "defend-terminate",
      globalTerminateMessage: defaults.abuseDetectedTerminationMessage,
      globalTransferMessage: defaults.abuseDetectedTransferMessage
    });
    const out = {};
    for (const [code, defaults] of Object.entries(SUPPORTED_LOCALE_DEFAULTS)) {
      if (isLocaleDefaultsByVariant(defaults)) {
        out[`${code}-feminine`] = { config: configDefaults(defaults.feminine) };
        out[`${code}-masculine`] = { config: configDefaults(defaults.masculine) };
      } else {
        out[code] = { config: configDefaults(defaults) };
      }
    }
    return out;
  }
  function synthesisRewritesLocalization() {
    const out = {};
    for (const [variantKey, code, defaults] of LOCALIZED_DEFAULTS) {
      out[variantKey] = {
        synthesisRewrites: defaults.defaultVoiceSynthesisRewrites,
        enabledDefaultSynthesisRewriteRuleIds: getDefaultSynthesisRewriteRuleMetadataForLocale(code)
      };
    }
    return out;
  }
  var ALLOWED_FILE_UPLOAD_TYPE_ITEMS = [
    { id: "application/pdf", label: "PDF" },
    { id: "text/csv", label: "CSV" },
    { id: "image/gif", label: "Image (GIF)" },
    { id: "image/jpeg", label: "Image (JPEG)" },
    { id: "image/jpg", label: "Image (JPG)" },
    { id: "image/png", label: "Image (PNG)" },
    { id: "image/webp", label: "Image (WebP)" },
    {
      id: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      label: "Word Document (DOCX)"
    },
    {
      id: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      label: "Excel Spreadsheet (XLSX)"
    },
    {
      id: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      label: "PowerPoint Presentation (PPTX)"
    },
    { id: "application/msword", label: "Word Document (DOC)" },
    { id: "application/vnd.ms-excel", label: "Excel Spreadsheet (XLS)" },
    { id: "application/vnd.ms-powerpoint", label: "PowerPoint Presentation (PPT)" },
    { id: "text/plain", label: "Text File (TXT)" },
    { id: "video/quicktime", label: "Video (MOV)" },
    { id: "video/mp4", label: "Video (MP4)" },
    { id: "video/webm", label: "Video (WebM)" },
    { id: "video/x-msvideo", label: "Video (AVI)" }
  ];
  var BaseSchema = {
    contentFolders: [
      defineConstantEntry({
        name: "brand",
        label: "Brand",
        description: "Agent name and language guidance",
        icon: "chat" /* Chat */,
        type: defineType({
          name: "Brand",
          fields: [
            defineField({
              type: "constant",
              name: "description",
              label: "Description",
              value: "When responding to a request, agent will use these settings."
            }),
            defineField({
              type: "text",
              name: "organizationName",
              label: "Organization name"
            }),
            defineField({
              type: "text",
              name: "agentName",
              label: "Agent name"
            }),
            defineField({
              type: "text",
              name: "customerServiceTeamName",
              label: "Customer service team name",
              placeholder: "Customer Service",
              optional: true
            }),
            defineField({
              type: "text",
              name: "customerNoun",
              label: "Customer noun",
              placeholder: "customer",
              defaultValue: "customer",
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "languageGuidance",
              label: "Language guidance to inform tone and style",
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "knowledgeLanguageGuidance",
              label: "Language guidance specific to how the agent answers questions from the knowledge base",
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "glossary",
              label: "Glossary of terms and definitions",
              optional: true
            }),
            defineField({
              type: "array",
              name: "rules",
              label: "Rules to steer the agent's behavior",
              childType: {
                type: "text"
              }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: "voice",
        label: "Voice",
        description: "Voice settings for the agent",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "Voice",
          fields: [
            defineField({
              name: "voiceGreeting",
              label: "Greeting message",
              type: "multiline",
              optional: true
            }),
            defineField({
              type: "checkbox",
              name: "uninterruptibleGreeting",
              label: "Prevent customer from interrupting the greeting",
              defaultValue: false
            }),
            defineField({
              name: "languageGuidance",
              label: "Voice language guidance to inform tone and style",
              type: "multiline",
              optional: true
            }),
            defineField({
              type: "picklist",
              name: "webAccess",
              label: "Web Access",
              items: [
                {
                  id: "on",
                  label: "On everywhere"
                },
                {
                  id: "staging",
                  label: "Only staging and mock releases"
                },
                {
                  id: "off",
                  label: "Off everywhere"
                }
              ]
            }),
            defineField({
              type: "array",
              name: "synthesisRewrites",
              label: "Rewrite pronunciation (e.g. FAQ -> ef ay cue)",
              childType: defineField({
                type: "object",
                name: "pronunciationRewrite",
                label: "Pronunciation rewrite",
                display: {
                  type: "horizontal",
                  columns: ["grow", "grow"],
                  hideHeaders: false
                },
                fields: [
                  defineField({
                    type: "text",
                    name: "pattern",
                    label: "Pattern to match"
                  }),
                  defineField({
                    type: "text",
                    name: "replacement",
                    label: "Replacement"
                  })
                ]
              })
            })
          ]
        })
      })
    ]
  };
  var Intents = defineListEntry({
    name: "intents",
    label: "Intents",
    description: "Automatically tagged intents",
    icon: "tag" /* Tag */,
    type: defineType({
      name: "intentConfiguration",
      fields: [
        defineField({
          type: "text",
          name: "intentName",
          label: 'Intent Name (e.g. "Account Lockout")'
        }),
        defineField({
          type: "multiline",
          name: "intentDescription",
          label: 'Description of the intent (e.g. "Customer is locked out of their account")',
          rows: 2
        }),
        defineField({
          type: "array",
          name: "intentTags",
          label: 'Tags to apply when detected (e.g. "account-lockout")',
          childType: defineField({
            type: "text",
            name: "intentTag",
            label: "Tag",
            validation: (rule) => [
              rule.minLength(1).error("Tag should not be empty."),
              rule.regex(/^\S+$/).error("Tag should not have spaces.")
            ]
          }),
          validation: (rule) => rule.minLength(1).warn("No tags are set for this intent")
        })
      ]
    })
  });
  var Guardrails = defineContentFolder({
    name: "guardrails",
    label: "Guardrails",
    description: "Error handling, abuse detection, and data collection policies",
    icon: "guardrails" /* Guardrails */,
    children: [
      defineConstantEntry({
        name: "errors",
        label: "Errors and abuse",
        description: "Handling errors and abuse",
        icon: "guardrails" /* Guardrails */,
        type: defineType({
          name: "Errors",
          fields: [
            defineField({
              type: "constant",
              name: "description",
              label: "Description",
              value: "Monitor messages in the conversation for common types of abuse and errors."
            }),
            defineField({
              type: "picklist",
              name: "abuseDetectionMode",
              label: "Abuse detection mode",
              defaultValue: "defend-terminate",
              items: [
                {
                  id: "defend-terminate",
                  label: "Actively defend (terminate conversation)"
                },
                {
                  id: "defend-transfer",
                  label: "Actively defend (immediately transfer to a representative)"
                },
                {
                  id: "observe",
                  label: "Observe & log"
                }
              ]
            }),
            defineField({
              type: "picklist",
              name: "allowedBehaviors",
              label: "Allowed behaviors",
              multiselect: true,
              items: [
                {
                  id: "PublicFigure",
                  label: "Discussing public figures"
                },
                {
                  id: "NamedIndividual",
                  label: "Discussing named individuals"
                },
                {
                  id: "OtherCompany",
                  label: "Discussing other companies"
                },
                {
                  id: "CustomerOffensive",
                  label: "Customer using offensive language"
                },
                {
                  id: "OutOfBounds",
                  label: "Off-topic conversations"
                }
              ]
            }),
            defineField({
              type: "multiline",
              name: "abuseDetectedTerminationMessage",
              label: "Message when abuse is detected and conversation is terminated",
              showIf: equals("abuseDetectionMode", "defend-terminate"),
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "abuseDetectedTransferMessage",
              label: "Message when abuse is detected and conversation is transferred",
              showIf: equals("abuseDetectionMode", "defend-transfer"),
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "errorMessage",
              label: "Agent message on unrecoverable error"
            }),
            defineField({
              type: "picklist",
              name: "allowedFileUploadTypes",
              label: "Allowed file upload types",
              multiselect: true,
              items: [...ALLOWED_FILE_UPLOAD_TYPE_ITEMS]
            })
          ]
        })
      }),
      defineConstantEntry({
        name: "safety",
        label: "Sensitive data collection",
        description: "Configure sensitive data collection",
        icon: "guardrails" /* Guardrails */,
        type: defineType({
          name: "Safety",
          fields: [
            defineField({
              type: "constant",
              name: "description",
              label: "Description",
              value: `By default, agents are not permitted to collect sensitive customer information such as:
\u2022 Social security number
\u2022 Last 4 digits of social security number
\u2022 Passport number
\u2022 Full credit card number
\u2022 Full debit card number
\u2022 CVV
\u2022 Last 4 digits of a payment card number
\u2022 Last 4 digits of credit card number
\u2022 Last 4 digits of debit card number
\u2022 Bank account number
\u2022 ACH routing number
\u2022 Gift card number
\u2022 Last 4 digits of a gift card number
\u2022 Gift card security code

If your use case requires the agent to collect any of this data, please explicitly enable the relevant categories below.

Note: Full 16-digit card numbers and CVV cannot be collected by the agent directly and must only be collected through other secure methods.

Note: Gift card numbers may or may not fall under PCI scope depending on the provider. If you have confirmed that your customer's gift cards are out of PCI scope, you should disable this category to prevent false positives.`
            }),
            defineField({
              type: "picklist",
              name: "allowedSensitiveInfo",
              label: "Allowed sensitive information",
              multiselect: true,
              items: [
                {
                  id: "social security number",
                  label: "Social security number"
                },
                {
                  id: "last 4 digits of social security number",
                  label: "Last 4 digits of social security number"
                },
                {
                  id: "passport number",
                  label: "Passport number"
                },
                {
                  id: "bank account number",
                  label: "Bank account number"
                },
                {
                  id: "ACH routing number",
                  label: "ACH routing number"
                },
                {
                  id: "last 4 digits of a payment card number",
                  label: "Last 4 digits of a payment card number"
                },
                {
                  id: "last 4 digits of credit card number",
                  label: "Last 4 digits of credit card number"
                },
                {
                  id: "last 4 digits of debit card number",
                  label: "Last 4 digits of debit card number"
                },
                {
                  id: "gift card number",
                  label: "Gift card number"
                },
                {
                  id: "last 4 digits of a gift card number",
                  label: "Last 4 digits of a gift card number"
                },
                {
                  id: "gift card security code",
                  label: "Gift card security code"
                }
              ]
            })
          ]
        })
      })
    ]
  });
  var TransfersWithEscalations = defineContentFolder({
    name: "transfers",
    label: "Contact center handoffs",
    description: "Setup, hours, and escalation rules",
    icon: "company" /* Company */,
    children: [
      defineConstantEntry({
        name: "transferSettings",
        label: "Agent handoff messages",
        icon: "chat" /* Chat */,
        type: defineType({
          name: "TransferSettings",
          fields: [
            defineField({
              type: "multiline",
              name: "offerTransferMessage",
              label: "Agent message when offering a transfer for an unresolved issue"
            }),
            defineField({
              type: "multiline",
              name: "transferMessage",
              label: "Agent message upon executing handoff"
            })
          ]
        })
      }),
      defineListEntry({
        name: "escalations",
        label: "Automatic escalations",
        icon: "ai" /* AI */,
        type: defineType({
          name: "Escalation",
          fields: [
            defineField({
              type: "constant",
              name: "explainer",
              label: "Explainer",
              value: "When to escalate to a live agent."
            }),
            defineField({
              type: "text",
              name: "tag",
              label: "Tag for this escalation",
              maxLength: 50
            }),
            defineField({
              type: "multiline",
              name: "description",
              label: "Conditions for escalation (be specific)",
              rows: 2
            }),
            defineField({
              type: "picklist",
              name: "escalationAction",
              label: "Escalation action",
              items: [
                {
                  id: "transfer",
                  label: "Transfer to a representative immediately"
                },
                {
                  id: "offer",
                  label: "Offer the option to transfer to a representative"
                }
              ]
            }),
            defineField({
              type: "multiline",
              name: "offerTransferMessage",
              label: "Agent message when offering a transfer",
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "transferMessage",
              label: "Agent message when handoff is complete",
              optional: true
            })
          ]
        })
      }),
      defineConstantEntry({
        "name": "supportTeamHoursByDay",
        "label": "Support team hours",
        icon: "calendar" /* Calendar */,
        "type": defineType({
          "name": "SupportTeamHours",
          "fields": [
            defineField({
              type: "constant",
              name: "description",
              label: "Description",
              value: "Hours your support team is available."
            }),
            defineField({
              "type": "picklist",
              "name": "timezone",
              "label": "Timezone",
              "items": [
                {
                  "id": "America/New_York",
                  "label": "America/New_York"
                },
                {
                  "id": "America/Chicago",
                  "label": "America/Chicago"
                },
                {
                  "id": "America/Denver",
                  "label": "America/Denver"
                },
                {
                  "id": "America/Los_Angeles",
                  "label": "America/Los_Angeles"
                },
                {
                  "id": "Europe/London",
                  "label": "Europe/London"
                },
                {
                  "id": "Europe/Paris",
                  "label": "Europe/Paris"
                },
                {
                  "id": "Europe/Berlin",
                  "label": "Europe/Berlin"
                },
                {
                  "id": "Europe/Istanbul",
                  "label": "Europe/Istanbul"
                },
                {
                  "id": "Asia/Tokyo",
                  "label": "Asia/Tokyo"
                },
                {
                  "id": "Asia/Singapore",
                  "label": "Asia/Singapore"
                },
                {
                  "id": "Australia/Sydney",
                  "label": "Australia/Sydney"
                }
              ]
            }),
            defineField({
              type: "multiline",
              name: "afterHoursMessage",
              label: "After Hours Message"
            }),
            ...operatingHours({ increment: 30 })
          ]
        })
      })
    ]
  });
  var DETECT_ABUSE_DEFEND_MODE_ITEMS = [
    { id: "defend-terminate", label: "Actively defend (terminate conversation)" },
    { id: "defend-transfer", label: "Actively defend (transfer to representative)" }
  ];
  var DETECT_ABUSE_ALL_MODE_ITEMS = [
    { id: "observe", label: "Observe and log" },
    ...DETECT_ABUSE_DEFEND_MODE_ITEMS
  ];
  function makeAbuseTypeObjectField(entry) {
    const fields = [];
    if (!entry.isCore) {
      fields.push(
        defineField({
          type: "checkbox",
          name: "disabled",
          label: "Disable this category",
          defaultValue: false
        })
      );
    }
    fields.push(
      defineField({
        type: "picklist",
        name: "mode",
        label: "Guardrail action",
        optional: true,
        items: entry.isCore ? [...DETECT_ABUSE_DEFEND_MODE_ITEMS] : [...DETECT_ABUSE_ALL_MODE_ITEMS]
      }),
      defineField({
        type: "multiline",
        name: "terminateMessage",
        label: "Guardrail response",
        showIf: equals("mode", "defend-terminate"),
        rows: 3,
        optional: true
      }),
      defineField({
        type: "multiline",
        name: "transferMessage",
        label: "Guardrail response",
        showIf: equals("mode", "defend-transfer"),
        rows: 3,
        optional: true
      }),
      defineField({
        type: "array",
        name: "additionalDescriptions",
        label: "Additional descriptions",
        description: 'Extra examples of customer behavior that should be classified as this type of abuse, added on top of the built-in detection. Each description should describe what the customer is doing (for example, "The customer is asking the agent to recommend specific stocks").',
        optional: true,
        childType: {
          type: "text",
          optional: true,
          placeholder: "The customer is...",
          validation: (rule) => rule.optional().minLength(1).error("Description should not be empty.")
        }
      }),
      defineField({
        type: "array",
        name: "honeypots",
        label: "Allowances",
        description: "Examples of legitimate customer behavior that look similar to this category but should not be treated as abuse. Add descriptions here to mitigate false positive detections.",
        optional: true,
        childType: {
          type: "text",
          optional: true,
          placeholder: "The customer is...",
          validation: (rule) => rule.optional().minLength(1).error("Allowance should not be empty.")
        }
      })
    );
    fields.push(
      defineField({
        type: "number",
        name: "maxAllowed",
        label: "Detections before escalation",
        description: "Number of detections required to escalate. For example, 3 means escalate on the third detection (the first two can show the response below). Leave blank to use the default. Set to 1 to escalate immediately.",
        optional: true,
        minValue: 1
      }),
      defineField({
        type: "multiline",
        name: "refocusMessage",
        label: "Response before escalation",
        rows: 3,
        optional: true
      })
    );
    return defineField({
      type: "object",
      name: entry.id,
      label: entry.label,
      description: entry.description,
      optional: true,
      display: { type: "vertical" },
      fields,
      isCore: entry.isCore
    });
  }
  var CoreSchema = {
    contentFolders: [
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:voice`,
        label: "Voice Configuration",
        description: "Voice settings for the agent",
        icon: "chat" /* Chat */,
        type: defineType({
          name: "CoreVoiceConfig",
          fields: [
            defineField({
              type: "text",
              name: "persona",
              label: "Persona"
            }),
            defineField({
              type: "number",
              name: "speakingRate",
              label: "Speaking rate",
              optional: true
            }),
            defineField({
              type: "array",
              name: "keywords",
              label: "Keywords",
              childType: {
                type: "text",
                name: "keyword",
                label: "Keyword"
              }
            }),
            defineField({
              type: "multiline",
              name: "webDisclosure",
              label: "Web Disclosure",
              optional: true
            }),
            defineField({
              type: "checkbox",
              name: "enableOutboundDtmfBot",
              label: "Enable outbound keypad tones",
              optional: true
            }),
            defineField({
              type: "number",
              name: "inactivityTimeoutSeconds",
              label: "Inactivity timeout (seconds)",
              optional: true,
              minValue: 0,
              maxValue: MAX_INACTIVITY_TIMEOUT_SECONDS
            }),
            defineField({
              type: "number",
              name: "inactivityMaxCount",
              label: "Max inactivity prompts before hangup",
              optional: true,
              minValue: 0,
              maxValue: MAX_INACTIVITY_COUNT
            }),
            defineField({
              type: "multiline",
              name: "inactivityPromptMessage",
              label: "Inactivity prompt message",
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "inactivityHangupMessage",
              label: "Inactivity hangup message",
              optional: true
            }),
            defineField({
              type: "picklist",
              name: "inactivityMode",
              label: "Inactivity mode",
              optional: true,
              items: [
                {
                  id: "static",
                  label: "Static"
                },
                {
                  id: "adaptive",
                  label: "Adaptive"
                }
              ]
            }),
            defineField({
              type: "number",
              name: "adaptiveMinWaitSeconds",
              label: "Adaptive minimum wait time (seconds)",
              optional: true,
              minValue: 0,
              maxValue: MAX_ADAPTIVE_WAIT_SECONDS
            }),
            defineField({
              type: "number",
              name: "adaptiveMaxWaitSeconds",
              label: "Adaptive maximum wait time (seconds)",
              optional: true,
              minValue: 0,
              maxValue: MAX_ADAPTIVE_WAIT_SECONDS
            }),
            defineField({
              type: "array",
              name: "localeConfigs",
              label: "Locale Configurations",
              childType: defineField({
                type: "object",
                name: "localeConfig",
                label: "Locale Configuration",
                display: {
                  type: "vertical"
                },
                fields: [
                  defineField({
                    type: "text",
                    name: "locale",
                    label: "Locale"
                  }),
                  defineField({
                    type: "text",
                    name: "persona",
                    label: "Persona",
                    optional: true
                  }),
                  defineField({
                    type: "number",
                    name: "speakingRate",
                    label: "Speaking rate",
                    optional: true
                  }),
                  defineField({
                    type: "array",
                    name: "keywords",
                    label: "Keywords",
                    childType: {
                      type: "text",
                      name: "keyword",
                      label: "Keyword"
                    }
                  }),
                  defineField({
                    type: "multiline",
                    name: "greeting",
                    label: "Greeting",
                    optional: true
                  }),
                  defineField({
                    type: "checkbox",
                    name: "uninterruptibleGreeting",
                    label: "Prevent customer from interrupting the greeting",
                    defaultValue: false
                  }),
                  defineField({
                    type: "array",
                    name: "synthesisRewrites",
                    label: "Rewrite pronunciation (e.g. FAQ -> ef ay cue)",
                    childType: defineField({
                      type: "object",
                      name: "pronunciationRewrite",
                      label: "Pronunciation rewrite",
                      display: {
                        type: "horizontal",
                        columns: ["grow", "grow"],
                        hideHeaders: false
                      },
                      fields: [
                        defineField({
                          type: "text",
                          name: "pattern",
                          label: "Pattern to match"
                        }),
                        defineField({
                          type: "text",
                          name: "replacement",
                          label: "Replacement"
                        })
                      ]
                    })
                  }),
                  defineField({
                    type: "multiline",
                    name: "inactivityPromptMessage",
                    label: "Inactivity prompt message",
                    optional: true
                  }),
                  defineField({
                    type: "multiline",
                    name: "inactivityHangupMessage",
                    label: "Inactivity hangup message",
                    optional: true
                  })
                ]
              })
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentConfig`,
        label: "Agent configuration",
        description: "Goal agent configuration",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreAgentConfig",
          fields: [
            defineField({
              type: "object",
              name: "progressIndicators",
              label: "Progress indicators",
              optional: true,
              display: {
                type: "vertical"
              },
              fields: [
                defineField({
                  type: "picklist",
                  name: "mode",
                  label: "Mode",
                  items: [...PROGRESS_INDICATOR_MODE_OPTIONS],
                  defaultValue: DEFAULT_PROGRESS_INDICATORS.mode
                }),
                defineField({
                  type: "number",
                  name: "initialDelayMs",
                  label: "Initial delay (ms)",
                  optional: true,
                  minValue: 0,
                  maxValue: MAX_INITIAL_DELAY_MS
                }),
                defineField({
                  type: "number",
                  name: "trailingSilenceMs",
                  label: "Trailing silence (ms)",
                  defaultValue: DEFAULT_PROGRESS_INDICATORS.trailingSilenceMs,
                  optional: true,
                  minValue: 0,
                  maxValue: MAX_TRAILING_SILENCE_MS
                }),
                defineField({
                  type: "checkbox",
                  name: "chatEnabled",
                  label: "Show in chat",
                  defaultValue: DEFAULT_PROGRESS_INDICATORS.chatEnabled
                }),
                defineField({
                  type: "multiline",
                  name: "additionalInstructions",
                  label: "Additional instructions",
                  optional: true
                })
              ]
            }),
            defineField({
              type: "picklist",
              name: "disabledDefaults",
              label: "Disabled defaults",
              multiselect: true,
              items: [...GOAL_DEFAULT_OPTIONS],
              optional: true
            }),
            defineField({
              type: "picklist",
              name: "learningModes",
              label: "Learning modes",
              multiselect: true,
              items: [...MODERATION_MODE_OPTIONS],
              optional: true
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:personaConfig`,
        label: "Persona configuration",
        description: "Agent personality and communication style",
        icon: "chat" /* Chat */,
        type: defineType({
          name: "PersonaConfig",
          fields: [
            defineField({
              type: "picklist",
              name: "personalityTraits",
              label: "Personality traits",
              multiselect: true,
              items: [...PERSONALITY_TRAIT_OPTIONS],
              optional: true
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentPersonaConfig`,
        label: "Persona configuration",
        description: "Agent personality and communication style",
        icon: "chat" /* Chat */,
        type: defineType({
          name: "CoreAgentPersonaConfig",
          localization: perLocaleDefaults({
            personalityTraits: "personaConfigDefaultTraitIds"
          }),
          fields: [
            defineField({
              type: "per_locale",
              name: "personalityTraits",
              label: "Personality traits",
              childType: {
                type: "picklist",
                multiselect: true,
                items: [...SDK_AGENT_PERSONA_CONFIG_TRAIT_ITEMS],
                optional: true
              }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:detectAbuse`,
        label: "Guardrails",
        description: "Per-type abuse detection configuration",
        icon: "guardrails" /* Guardrails */,
        type: defineType({
          name: "DetectAbuseConfig",
          fields: [
            defineField({
              type: "multiline",
              name: "context",
              label: "Agent context",
              description: "Describe what the agent does. This helps the guardrails distinguish legitimate requests from abuse, reducing false positives.",
              rows: 3,
              optional: true,
              placeholder: "This agent helps customers with..."
            }),
            defineField({
              type: "picklist",
              name: "globalMode",
              label: "Global guardrail action",
              defaultValue: "defend-terminate",
              items: [...DETECT_ABUSE_DEFEND_MODE_ITEMS]
            }),
            defineField({
              type: "multiline",
              name: "globalTerminateMessage",
              label: "Global guardrail response",
              showIf: equals("globalMode", "defend-terminate"),
              rows: 3,
              optional: true
            }),
            defineField({
              type: "multiline",
              name: "globalTransferMessage",
              label: "Global guardrail response",
              showIf: equals("globalMode", "defend-transfer"),
              rows: 3,
              optional: true
            }),
            ...ABUSE_TYPES.map((entry) => makeAbuseTypeObjectField(entry))
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:abuse`,
        label: "Guardrails",
        description: "Per-type abuse detection configuration",
        icon: "guardrails" /* Guardrails */,
        type: defineType({
          name: "CoreAbuseConfig",
          localization: abuseConfigPerLocaleDefaults(),
          fields: [
            defineField({
              type: "per_locale",
              name: "config",
              label: "Guardrails",
              childType: {
                type: "object",
                display: { type: "vertical" },
                fields: [
                  defineField({
                    type: "multiline",
                    name: "context",
                    label: "Agent context",
                    description: "Describe what the agent does. This helps the guardrails distinguish legitimate requests from abuse, reducing false positives.",
                    rows: 3,
                    optional: true,
                    placeholder: "This agent helps customers with..."
                  }),
                  defineField({
                    type: "picklist",
                    name: "globalMode",
                    label: "Global guardrail action",
                    defaultValue: "defend-terminate",
                    items: [...DETECT_ABUSE_DEFEND_MODE_ITEMS]
                  }),
                  defineField({
                    type: "multiline",
                    name: "globalTerminateMessage",
                    label: "Global guardrail response",
                    showIf: equals("globalMode", "defend-terminate"),
                    rows: 3,
                    optional: true
                  }),
                  defineField({
                    type: "multiline",
                    name: "globalTransferMessage",
                    label: "Global guardrail response",
                    showIf: equals("globalMode", "defend-transfer"),
                    rows: 3,
                    optional: true
                  }),
                  ...ABUSE_TYPES.map(makeAbuseTypeObjectField)
                ]
              }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentResponseModeration`,
        label: "Response supervision",
        description: "Enable extra supervision for correctness at the cost of some latency",
        icon: "guardrails" /* Guardrails */,
        type: defineType({
          name: "CoreAgentResponseSupervision",
          fields: [
            defineField({
              type: "picklist",
              name: "moderationModes",
              label: "Response supervision",
              multiselect: true,
              picklistDisplay: "expanded",
              items: [...MODERATION_MODE_OPTIONS],
              optional: true
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:progressIndicators`,
        label: "Progress indicators",
        description: "Configure progress indicator behavior",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreProgressIndicators",
          localization: perLocaleDefaults({
            mode: "progressIndicatorMode",
            initialDelayMs: "progressIndicatorInitialDelayMs",
            trailingSilenceMs: "progressIndicatorTrailingSilenceMs",
            chatEnabled: "progressIndicatorChatEnabled",
            additionalInstructions: "progressIndicatorAdditionalInstructions"
          }),
          fields: [
            defineField({
              type: "per_locale",
              name: "mode",
              label: "Mode",
              childType: {
                type: "picklist",
                description: "Personalized creates context-aware progress messages before the agent responds. None disables progress indicators.",
                items: [...PROGRESS_INDICATOR_MODE_OPTIONS]
              }
            }),
            defineField({
              type: "per_locale",
              name: "initialDelayMs",
              label: "Initial delay (ms)",
              childType: {
                type: "number",
                description: "Time to wait before sending the first personalized progress indicator.",
                optional: true,
                minValue: 0,
                maxValue: MAX_INITIAL_DELAY_MS
              }
            }),
            defineField({
              type: "per_locale",
              name: "trailingSilenceMs",
              label: "Trailing silence (ms)",
              childType: {
                type: "number",
                description: "For voice, time to pause after a progress indicator before continuing with the agent response.",
                optional: true,
                minValue: 0,
                maxValue: MAX_TRAILING_SILENCE_MS
              }
            }),
            defineField({
              type: "per_locale",
              name: "chatEnabled",
              label: "Show in chat",
              childType: {
                type: "checkbox",
                description: "Also send progress indicators in chat conversations. When off, progress indicators are voice-only."
              }
            }),
            defineField({
              type: "per_locale",
              name: "additionalInstructions",
              label: "Additional instructions",
              childType: {
                type: "multiline",
                description: "Guidance for how generated progress messages should sound, such as tone, length, and language.",
                optional: true,
                rows: 3
              }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:reasoningProgressIndicator`,
        label: "Progress indicator reasoning",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreReasoningProgressIndicator",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable reasoning for personalized progress indicators",
              subtitle: "In personalized progress-indicator mode, generates messages tailored to what the agent is doing (e.g., 'Let me check that order'). Disable for faster but more generic 'thinking' messages.",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:lowConfidenceTranscription`,
        label: "Low-confidence transcription supervisor",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreLowConfidenceTranscription",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable low-confidence transcription supervisor",
              subtitle: "Helps the agent handle noisy audio (e.g., noisy environments, strong accents) by being cautious about words it may have misheard. Disable to reduce latency when audio quality isn't a concern.",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:suppressVoiceAttachments`,
        label: "Voice attachment suppression",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreSuppressVoiceAttachments",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable voice attachment suppression",
              subtitle: "Suppresses tool-returned attachments (images, files, cards) during voice conversations, since most voice devices can't display them. Disable to allow attachments through for voice channels with visual support (e.g., visual IVR, companion-app voice).",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:conservativeTransfer`,
        label: "Conservative transfer",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreConservativeTransfer",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable conservative transfer",
              subtitle: "The agent transfers only when your agent spec defines a transfer condition, instead of proactively offering transfers. Disable to make the agent offer transfers more freely.",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:detectDeadlocks`,
        label: "Deadlock detection",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreDetectDeadlocks",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable deadlock detection",
              subtitle: "Detects when the agent's message implies a follow-up that won't actually come (e.g., 'let me look into that for you') and self-corrects so the customer isn't left hanging. Disable for email or asynchronous channels where deferred follow-ups are expected.",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:standardPrompts`,
        label: "Standard customer-service prompts",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreStandardPrompts",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable standard customer-service prompts",
              subtitle: "Built-in customer-service prompts that govern baseline agent behavior. Only disable for agents whose behavior is deliberately very different from a standard customer-service agent.",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:detectMissingPolicy`,
        label: "Missing policy detection",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreDetectMissingPolicy",
          fields: [
            defineField({
              type: "checkbox",
              name: "disabled",
              label: "Disable missing policy detection",
              subtitle: "The agent automatically flags customer requests it can't fully answer due to missing policies, so you can add coverage. Disable for a fully scoped agent where out-of-scope flags would just be noise.",
              defaultValue: false
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:fileUploads`,
        label: "File uploads",
        description: "Configure file upload handling",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreFileUploads",
          fields: [
            defineField({
              type: "picklist",
              name: "allowedFileUploadTypes",
              label: "Allowed file upload types",
              multiselect: true,
              optional: true,
              items: [...ALLOWED_FILE_UPLOAD_TYPE_ITEMS]
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentErrorMessage`,
        label: "Unrecoverable error message",
        description: "Message shown when the agent hits an unrecoverable error",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreAgentErrorMessage",
          localization: perLocaleDefaults({
            errorMessage: "errorMessage"
          }),
          fields: [
            defineField({
              type: "per_locale",
              name: "errorMessage",
              label: "Agent message on unrecoverable error",
              childType: { type: "multiline", rows: 3 }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:outboundVoiceGreetingDelayMs`,
        label: "Outbound voice greeting delay",
        description: "Configure the delay before the agent greets after an outbound call is answered",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "OutboundVoiceGreetingDelay",
          fields: [
            defineField({
              type: "number",
              name: "delayMs",
              label: "Greeting delay after answer (ms)",
              description: "How long the agent waits after an outbound call is answered before greeting the customer.",
              optional: true,
              minValue: 0,
              maxValue: MAX_OUTBOUND_START_DELAY_MS
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentVoiceGreeting`,
        label: "Voice greeting",
        description: "Default voice greeting used when a locale does not override it",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "CoreAgentVoiceGreeting",
          localization: perLocaleDefaults({
            defaultGreeting: "defaultVoiceGreeting",
            uninterruptibleGreeting: "uninterruptibleGreeting"
          }),
          fields: [
            defineField({
              name: "defaultGreeting",
              label: "Greeting message",
              type: "per_locale",
              childType: { type: "multiline", optional: true, rows: 3 }
            }),
            defineField({
              type: "per_locale",
              name: "uninterruptibleGreeting",
              label: "Prevent customer from interrupting the greeting",
              childType: { type: "checkbox" }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentVoice`,
        label: "Agent Voice",
        description: "Default voice the agent uses to talk to users",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "CoreAgentVoice",
          localization: perLocaleDefaults({
            persona: "defaultVoicePersona"
          }),
          fields: [
            defineField({
              // Stored as a persona ID; the Voice system package labels it as Voice and renders org-restricted options.
              type: "per_locale",
              name: "persona",
              label: "Voice",
              childType: { type: "text" }
            }),
            defineField({
              type: "per_locale",
              name: "speakingRate",
              label: "Speaking rate",
              childType: { type: "number", optional: true }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentVoiceTranscriptionKeywords`,
        label: "Transcription keywords",
        description: "Default transcription keywords used when a locale does not override them",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "CoreAgentVoiceKeywords",
          localization: perLocaleDefaults({
            keywords: "defaultVoiceKeywords"
          }),
          fields: [
            defineField({
              type: "per_locale",
              name: "keywords",
              label: "Keywords",
              childType: {
                type: "array",
                childType: {
                  type: "text",
                  name: "keyword",
                  label: "Keyword"
                }
              }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:agentVoiceSynthesisRewrites`,
        label: "Synthesis rewriting",
        description: "Default pronunciation rewrites used when a locale does not override them",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "CoreAgentVoiceSynthesisRewrites",
          localization: synthesisRewritesLocalization(),
          fields: [
            defineField({
              // Read-only metadata for the locale's built-in rewrite
              // rules. The Voice UI renders the label/description; the
              // runtime resolves pattern/replacement from the rule
              // registry by `id`. Not editable from the UI.
              type: "per_locale",
              name: "enabledDefaultSynthesisRewriteRuleIds",
              label: "Default rewrite rules",
              childType: {
                type: "array",
                childType: defineField({
                  type: "object",
                  name: "defaultSynthesisRewriteRule",
                  label: "Default rewrite rule",
                  display: {
                    type: "horizontal",
                    columns: ["grow", "grow", "grow"],
                    hideHeaders: true
                  },
                  fields: [
                    defineField({
                      type: "text",
                      name: "id",
                      label: "Rule ID"
                    }),
                    defineField({
                      type: "text",
                      name: "label",
                      label: "Label"
                    }),
                    defineField({
                      type: "text",
                      name: "description",
                      label: "Description",
                      optional: true
                    }),
                    defineField({
                      type: "text",
                      name: "playgroundSample",
                      label: "Playground sample",
                      optional: true
                    })
                  ]
                })
              }
            }),
            defineField({
              type: "per_locale",
              name: "synthesisRewrites",
              label: "Rewrite pronunciation (e.g. FAQ -> ef ay cue)",
              childType: {
                type: "array",
                childType: defineField({
                  type: "object",
                  name: "pronunciationRewrite",
                  label: "Pronunciation rewrite",
                  display: {
                    type: "horizontal",
                    columns: ["grow", "grow"],
                    hideHeaders: false
                  },
                  fields: [
                    defineField({
                      type: "text",
                      name: "pattern",
                      label: "Pattern to match"
                    }),
                    defineField({
                      type: "text",
                      name: "replacement",
                      label: "Replacement"
                    })
                  ]
                })
              }
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:safety`,
        label: "Sensitive data collection",
        description: "Configure sensitive data collection",
        icon: "guardrails" /* Guardrails */,
        type: defineType({
          name: "CoreSafety",
          fields: [
            defineField({
              type: "constant",
              name: "description",
              label: "Description",
              value: `By default, agents are not permitted to collect sensitive customer information such as:
\u2022 Social security number
\u2022 Last 4 digits of social security number
\u2022 Passport number
\u2022 Full credit card number
\u2022 Full debit card number
\u2022 CVV
\u2022 Last 4 digits of a payment card number
\u2022 Last 4 digits of credit card number
\u2022 Last 4 digits of debit card number
\u2022 Bank account number
\u2022 ACH routing number
\u2022 Gift card number
\u2022 Last 4 digits of a gift card number
\u2022 Gift card security code

If your use case requires the agent to collect any of this data, please explicitly enable the relevant categories below.

Note: Full 16-digit card numbers and CVV cannot be collected by the agent directly and must only be collected through other secure methods.

Note: Gift card numbers may or may not fall under PCI scope depending on the provider. If you have confirmed that your customer's gift cards are out of PCI scope, you should disable this category to prevent false positives.`
            }),
            defineField({
              type: "picklist",
              name: "allowedSensitiveInfo",
              label: "Allowed sensitive information",
              multiselect: true,
              items: [
                {
                  id: "social security number",
                  label: "Social security number"
                },
                {
                  id: "last 4 digits of social security number",
                  label: "Last 4 digits of social security number"
                },
                {
                  id: "passport number",
                  label: "Passport number"
                },
                {
                  id: "bank account number",
                  label: "Bank account number"
                },
                {
                  id: "ACH routing number",
                  label: "ACH routing number"
                },
                {
                  id: "last 4 digits of a payment card number",
                  label: "Last 4 digits of a payment card number"
                },
                {
                  id: "last 4 digits of credit card number",
                  label: "Last 4 digits of credit card number"
                },
                {
                  id: "last 4 digits of debit card number",
                  label: "Last 4 digits of debit card number"
                },
                {
                  id: "gift card number",
                  label: "Gift card number"
                },
                {
                  id: "last 4 digits of a gift card number",
                  label: "Last 4 digits of a gift card number"
                },
                {
                  id: "gift card security code",
                  label: "Gift card security code"
                }
              ]
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:brand`,
        label: "Brand",
        description: "Agent identity fields (organization, agent name, customer noun)",
        icon: "chat" /* Chat */,
        type: defineType({
          name: "CoreBrand",
          localization: perLocaleDefaults({
            organizationName: "defaultOrganizationName",
            agentName: "defaultAgentName"
          }),
          fields: [
            defineField({
              type: "per_locale",
              name: "organizationName",
              label: "Organization name",
              childType: { type: "text" }
            }),
            defineField({
              type: "per_locale",
              name: "agentName",
              label: "Agent name",
              childType: { type: "text" }
            }),
            defineField({
              type: "per_locale",
              name: "customerServiceTeamName",
              label: "Customer service team name",
              childType: {
                type: "text",
                optional: true,
                placeholder: "Customer Service"
              }
            }),
            defineField({
              type: "per_locale",
              name: "customerNoun",
              label: "Customer noun",
              childType: {
                type: "text",
                optional: true,
                placeholder: "customer",
                defaultValue: "customer"
              }
            })
          ]
        })
      }),
      localeConfigEntry(SIERRA_SDK_NAMESPACE),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:webChatVoice`,
        label: "Voice in chat",
        description: "Configure whether voice mode is available in the chat window",
        icon: "voice" /* Voice */,
        type: defineType({
          name: "CoreWebChatVoice",
          fields: [
            defineField({
              type: "picklist",
              name: "accessMode",
              label: "Voice availability",
              items: [
                {
                  id: "on",
                  label: "On everywhere"
                },
                {
                  id: "staging",
                  label: "Only staging and mock releases"
                },
                {
                  id: "off",
                  label: "Off everywhere"
                }
              ]
            })
          ]
        })
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:inactivityHandling`,
        label: "Voice inactivity handling",
        description: "Configure how the agent handles caller inactivity during voice calls",
        icon: "gear" /* Gear */,
        type: defineType({
          name: "CoreInactivityHandling",
          localization: perLocaleDefaults({
            inactivityMode: "inactivityMode",
            inactivityTimeoutSeconds: "inactivityTimeoutSeconds",
            inactivityMaxCount: "inactivityMaxCount",
            inactivityPromptMessage: "inactivityPromptMessage",
            inactivityHangupMessage: "inactivityHangupMessage",
            adaptiveMinWaitSeconds: "adaptiveMinWaitSeconds",
            adaptiveMaxWaitSeconds: "adaptiveMaxWaitSeconds"
          }),
          fields: [
            defineField({
              type: "per_locale",
              name: "inactivityMode",
              label: "Inactivity mode",
              childType: {
                type: "picklist",
                description: "Static uses the configured timeout and prompt message verbatim. Adaptive chooses a context-aware wait time and generates check-ins from the prompt instructions.",
                optional: true,
                items: [
                  {
                    id: "static",
                    label: "Static"
                  },
                  {
                    id: "adaptive",
                    label: "Adaptive"
                  }
                ]
              }
            }),
            defineField({
              type: "per_locale",
              name: "inactivityTimeoutSeconds",
              label: "Inactivity timeout (seconds)",
              childType: {
                type: "number",
                description: "Seconds to wait for a caller response before prompting. Valid range: 15-60 seconds.",
                optional: true,
                minValue: 0,
                maxValue: MAX_INACTIVITY_TIMEOUT_SECONDS
              }
            }),
            defineField({
              type: "per_locale",
              name: "inactivityMaxCount",
              label: "Max inactivity prompts before hangup",
              childType: {
                type: "number",
                description: "Number of inactivity prompts or adaptive check-ins before ending the call.",
                optional: true,
                minValue: 0,
                maxValue: MAX_INACTIVITY_COUNT
              }
            }),
            defineField({
              type: "per_locale",
              name: "inactivityPromptMessage",
              label: "Inactivity prompt message",
              childType: {
                type: "multiline",
                description: "Static mode speaks this verbatim when the caller is inactive. Adaptive mode uses it as instructions for generated check-ins.",
                optional: true,
                rows: 3
              }
            }),
            defineField({
              type: "per_locale",
              name: "inactivityHangupMessage",
              label: "Inactivity hangup message",
              childType: {
                type: "multiline",
                description: "Message to speak before ending the call due to inactivity.",
                optional: true,
                rows: 3
              }
            }),
            defineField({
              type: "per_locale",
              name: "adaptiveMinWaitSeconds",
              label: "Adaptive minimum wait time (seconds)",
              childType: {
                type: "number",
                description: "Shortest wait before a generated check-in. Up to 900 seconds.",
                optional: true,
                minValue: 0,
                maxValue: MAX_ADAPTIVE_WAIT_SECONDS
              }
            }),
            defineField({
              type: "per_locale",
              name: "adaptiveMaxWaitSeconds",
              label: "Adaptive maximum wait time (seconds)",
              childType: {
                type: "number",
                description: "Longest wait before a generated check-in. Up to 900 seconds.",
                optional: true,
                minValue: 0,
                maxValue: MAX_ADAPTIVE_WAIT_SECONDS
              }
            })
          ]
        })
      }),
      defineContentFolder({
        name: "conversationEvents",
        label: "Conversation events",
        description: "Configure conversation lifecycle events",
        icon: "activity" /* Activity */,
        children: [
          defineConstantEntry({
            name: `${SIERRA_SDK_NAMESPACE}:postConversationConfiguration`,
            label: "Post-conversation configuration",
            description: "Controls timing of callbacks that run after a conversation ends",
            icon: "gear" /* Gear */,
            type: defineType({
              name: "CorePostConversationConfiguration",
              fields: [
                defineField({
                  type: "number",
                  name: "postConversationDelaySeconds",
                  label: "Post-conversation callback delay (seconds)",
                  description: "Seconds to wait after the last message before scheduling the post-conversation trigger, up to 30 days. Set to 0 to disable scheduling.",
                  optional: true,
                  minValue: 0,
                  maxValue: MAX_POST_CONVERSATION_DELAY_SECONDS
                })
              ]
            })
          })
        ]
      }),
      defineConstantEntry({
        name: `${SIERRA_SDK_NAMESPACE}:packageStructureMigration`,
        label: "Package structure migration",
        type: defineType({
          name: "PackageStructureMigration",
          fields: [
            defineField({
              type: "array",
              name: "migratedPackageContentEntries",
              label: "Migrated entries",
              optional: true,
              childType: { type: "text", optional: true }
            }),
            defineField({
              type: "checkbox",
              name: "fullyMigratedToSdkContent",
              label: "Fully migrated to SDK content",
              optional: true
            })
          ]
        })
      })
    ]
  };
  var extend = (schema2, ...entries) => {
    return defineSchema({
      contentFolders: [...CoreSchema.contentFolders, ...schema2.contentFolders, ...entries]
    });
  };

  // content-schema.ts
  var schema = extend(
    // required
    BaseSchema,
    // optional -- removing these will disable corresponding features in the agent
    Intents,
    Guardrails
    // NOTE: if the agent relies on escalations, use `TransfersWithEscalations`
    // This seems to be handled by the new Live Agent Transfer integration
    // Transfers
  );
  var content_schema_default = schema;

  // node_modules/.pnpm/@sierra+content-schema@https+++packages.sierra.ai+content-schema-0.20260710.7195607.tgz/node_modules/@sierra/content-schema/validate.ts
  function shouldShowField(field, currentPath, rootValue) {
    const showIf = field.showIf;
    if (!showIf) {
      return true;
    }
    return evaluateShowIfCondition(showIf, currentPath, rootValue);
  }
  function evaluateShowIfCondition(condition, currentPath, rootValue) {
    switch (condition.type) {
      case "constant":
        return condition.value;
      case "and":
        return condition.conditions.every(
          (c) => evaluateShowIfCondition(c, currentPath, rootValue)
        );
      case "or":
        return condition.conditions.some(
          (c) => evaluateShowIfCondition(c, currentPath, rootValue)
        );
      case "field": {
        const fieldValue = getFieldValue(condition.field, currentPath, rootValue);
        if (fieldValue === void 0) {
          return false;
        }
        return evaluateComparison(condition.comparison, fieldValue);
      }
      case "environment":
        return true;
    }
  }
  function getFieldValue(fieldPath, currentPath, rootValue) {
    let parts;
    if (fieldPath.startsWith(".")) {
      const relativeParts = fieldPath.split(".").filter((p) => p !== "");
      parts = [...currentPath, ...relativeParts];
    } else {
      parts = fieldPath.split(".");
    }
    let value = rootValue;
    for (const part of parts) {
      if (part === "") continue;
      if (typeof value === "object" && value !== null) {
        const asObj = value;
        if (asObj["$type"] === "per_environment" || asObj["$type"] === "per_locale") {
          value = asObj[part]?.value;
        } else {
          value = asObj[part];
        }
      } else {
        return void 0;
      }
    }
    return value;
  }
  function evaluateComparison(comparison, fieldValue) {
    switch (comparison.type) {
      case "equals":
        return fieldValue === comparison.value;
      case "notEquals":
        return fieldValue !== comparison.value;
      case "oneOf":
        return comparison.values.includes(fieldValue);
      case "contains":
        return Array.isArray(fieldValue) && fieldValue.includes(comparison.value);
      case "greaterThan":
        return typeof fieldValue === "number" && fieldValue > comparison.value;
      case "lessThan":
        return typeof fieldValue === "number" && fieldValue < comparison.value;
    }
  }
  function validateTypeByName(schema2, typeName, content, opts) {
    const contentType = schema2.contentTypes.find((x) => x.name === typeName);
    if (!contentType) {
      return [];
    }
    return validateType2(schema2, contentType, content, opts, content, []);
  }
  function validateType2(schema2, type, content, opts, rootValue, currentPath) {
    if (type.type === "canned") {
      return [];
    }
    if (typeof content !== "object" || content === null || content === void 0) {
      return [{ message: "Entry is not an object" }];
    }
    const localization = type.localization;
    const results = type.fields.flatMap((field) => {
      if (!shouldShowField(field, currentPath, rootValue)) {
        return [];
      }
      return addToPath(
        field.name,
        validateTypeField(
          schema2,
          field,
          content[field.name],
          opts,
          rootValue,
          [...currentPath, field.name],
          {
            parentLocalization: localization,
            localizationPath: [field.name]
          }
        )
      );
    });
    return [...results, ...validateConstraints(type, content)];
  }
  function validateOAuthValue(contentValue) {
    if (typeof contentValue !== "object" || contentValue === null || Array.isArray(contentValue)) {
      return [{ message: "Value is not an oauth object" }];
    }
    const oauthValue = contentValue;
    const errors = [];
    if ("$type" in oauthValue && oauthValue["$type"] !== void 0 && oauthValue["$type"] !== "oauth") {
      errors.push({ path: ["$type"], message: 'Value must be "oauth"' });
    }
    if (typeof oauthValue["providerId"] !== "string" || oauthValue["providerId"] === "") {
      errors.push({ path: ["providerId"], message: "OAuth providerId is required" });
    }
    if ("url" in oauthValue && oauthValue["url"] !== void 0 && typeof oauthValue["url"] !== "string") {
      errors.push({ path: ["url"], message: "Value is not text" });
    }
    if ("tokenUrl" in oauthValue && oauthValue["tokenUrl"] !== void 0 && typeof oauthValue["tokenUrl"] !== "string") {
      errors.push({ path: ["tokenUrl"], message: "Value is not text" });
    }
    if ("urlTemplateParams" in oauthValue && oauthValue["urlTemplateParams"] !== void 0) {
      const urlTemplateParams = oauthValue["urlTemplateParams"];
      if (typeof urlTemplateParams !== "object" || urlTemplateParams === null || Array.isArray(urlTemplateParams)) {
        errors.push({ path: ["urlTemplateParams"], message: "Value is not an object" });
      } else {
        errors.push(
          ...Object.entries(urlTemplateParams).flatMap(
            ([key, value]) => typeof value === "string" ? [] : [{ path: ["urlTemplateParams", key], message: "Value is not text" }]
          )
        );
      }
    }
    if ("scopes" in oauthValue && oauthValue["scopes"] !== void 0) {
      const scopes = oauthValue["scopes"];
      if (!Array.isArray(scopes)) {
        errors.push({ path: ["scopes"], message: "Value is not an array" });
      } else {
        errors.push(
          ...scopes.flatMap(
            (scope, index) => typeof scope === "string" ? [] : [{ path: ["scopes", `${index}`], message: "Value is not text" }]
          )
        );
      }
    }
    return errors;
  }
  function validateResourceValue(contentValue, expectedResource) {
    if (typeof contentValue !== "object" || contentValue === null || Array.isArray(contentValue)) {
      return [{ message: "Value is not a resource selector" }];
    }
    const resourceValue = contentValue;
    const errors = [];
    if (resourceValue["$type"] !== "resource") {
      errors.push({ path: ["$type"], message: "Resource selector is missing $type" });
    }
    if (resourceValue["resource"] !== expectedResource) {
      errors.push({
        path: ["resource"],
        message: `Resource selector is not a ${expectedResource}`
      });
    }
    if (typeof resourceValue["id"] !== "string" || resourceValue["id"] === "") {
      errors.push({ path: ["id"], message: "Resource selector is missing id" });
    }
    return errors;
  }
  function validateTypeField(schema2, contentField, contentValue, opts, rootValue, currentPath, localization) {
    const {
      parentLocalization,
      localizationPath,
      valueScope: localizationValueScope
    } = localization ?? {};
    function checkType() {
      switch (contentField.type) {
        case "picklist": {
          const ids = contentField.items.map((x) => x.id);
          if (contentField.multiselect) {
            if (!Array.isArray(contentValue)) {
              return [{ message: `Value is not an array` }];
            }
            for (const v of contentValue) {
              if (!ids.includes(v)) {
                return [{ message: `Invalid picklist value ${v}` }];
              }
            }
          } else {
            if (!ids.includes(contentValue)) {
              return [{ message: `Invalid picklist value ${contentValue}` }];
            }
          }
          return [];
        }
        case "object":
          return contentField.fields.flatMap((field) => {
            if (!shouldShowField(field, currentPath, rootValue)) {
              return [];
            }
            return addToPath(
              field.name,
              validateTypeField(
                schema2,
                field,
                contentValue[field.name],
                opts,
                rootValue,
                [...currentPath, field.name],
                // Keep threading the owning type's localization so
                // nested fields can find their default, either via
                // the dotted key (key territory) or the per_locale
                // field's default object (value territory).
                {
                  parentLocalization,
                  localizationPath: localizationValueScope === void 0 && localizationPath !== void 0 ? [...localizationPath, field.name] : void 0,
                  valueScope: localizationValueScope !== void 0 ? {
                    ...localizationValueScope,
                    subPath: [
                      ...localizationValueScope.subPath,
                      field.name
                    ]
                  } : void 0
                }
              )
            );
          });
        case "array": {
          if (!Array.isArray(contentValue)) {
            return [{ message: `Value is not an array` }];
          }
          return contentValue.flatMap(
            (value, index) => addToPath(
              `${index}`,
              validateTypeField(schema2, contentField.childType, value, opts, rootValue, [
                ...currentPath,
                `${index}`
              ])
            )
          );
        }
        case "text":
        case "multiline":
        case "code":
        case "markdown":
        case "constant":
        case "date":
          return typeof contentValue === "string" ? [] : [{ message: `Value is not text` }];
        case "checkbox":
          return typeof contentValue === "boolean" ? [] : [{ message: `Value is not a boolean` }];
        case "number": {
          if (typeof contentValue !== "number") {
            return [{ message: `Value is not a number` }];
          }
          if (contentField.minValue !== void 0 && contentValue < contentField.minValue) {
            return [{ message: `Value must be at least ${contentField.minValue}` }];
          }
          if (contentField.maxValue !== void 0 && contentValue > contentField.maxValue) {
            return [{ message: `Value must be at most ${contentField.maxValue}` }];
          }
          return [];
        }
        case "file":
          return typeof contentValue === "string" ? [] : [{ message: `Value is not a file` }];
        case "reference":
          return typeof contentValue === "string" ? [] : [{ message: `Value is not a reference` }];
        case "resource":
          return validateResourceValue(contentValue, contentField.resource);
        case "per_environment":
          const perEnvValue = contentValue;
          return Object.entries(perEnvValue).flatMap(([key, value]) => {
            if (value?.enabled ?? false) {
              return addToPath(
                key,
                validateTypeField(
                  schema2,
                  contentField.childType,
                  value?.value,
                  opts,
                  rootValue,
                  [...currentPath, key]
                )
              );
            }
            return [];
          });
        case "per_resource": {
          const perResValue = contentValue;
          return Object.entries(perResValue).flatMap(([key, value]) => {
            if (value?.enabled ?? false) {
              return addToPath(
                key,
                validateTypeField(
                  schema2,
                  contentField.childType,
                  value?.value,
                  opts,
                  rootValue,
                  [...currentPath, key]
                )
              );
            }
            return [];
          });
        }
        case "per_locale": {
          if (typeof contentValue !== "object" || contentValue === null || Array.isArray(contentValue) || contentValue.$type !== "per_locale") {
            return [{ message: "Value is not a per_locale object" }];
          }
          const localeDefaultKey = localizationValueScope === void 0 ? localizationPath?.join(".") : void 0;
          const childHasDefault = localeDefaultKey !== void 0 && parentLocalization !== void 0 && Object.values(parentLocalization).some(
            (localeEntry) => localeDefaultKey in localeEntry
          );
          const childLocalization = childHasDefault ? parentLocalization : void 0;
          const perLocaleValue = contentValue;
          return Object.entries(perLocaleValue).flatMap(([key, entry]) => {
            if (key === "$type") {
              return [];
            }
            if (entry === void 0) {
              return [];
            }
            if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
              return addToPath(key, [{ message: "Locale entry is not an object" }]);
            }
            const localeEntry = entry;
            if (localeEntry.value === void 0) {
              return [];
            }
            return addToPath(
              key,
              validateTypeField(
                schema2,
                contentField.childType,
                localeEntry.value,
                opts,
                rootValue,
                [...currentPath, key],
                {
                  parentLocalization: childLocalization,
                  valueScope: childHasDefault && localeDefaultKey !== void 0 ? { key: localeDefaultKey, locale: key, subPath: [] } : void 0
                }
              )
            );
          });
        }
        case "secret":
          return [];
        case "oauth":
          return validateOAuthValue(contentValue);
        case "provider":
          return typeof contentValue === "string" ? [] : [{ message: `Value is not a provider selector` }];
      }
    }
    let errors = [];
    if (contentValue === void 0 || contentValue === null) {
      let hasSchemaLocalizationDefault = false;
      if (localizationValueScope !== void 0 && parentLocalization !== void 0) {
        hasSchemaLocalizationDefault = localizationEntriesForLocale(
          parentLocalization,
          localizationValueScope.locale
        ).some(
          (localeEntry) => hasLocalizationDefaultAtPath(
            localeEntry[localizationValueScope.key],
            localizationValueScope.subPath
          )
        );
      } else if (contentField.type === "per_locale" && parentLocalization !== void 0 && localizationPath !== void 0) {
        const localizationKey = localizationPath.join(".");
        hasSchemaLocalizationDefault = Object.values(parentLocalization).some(
          (localeEntry) => localizationKey in localeEntry
        );
      }
      if (opts.strict && contentField.type !== "constant" && contentField.type !== "markdown" && !allowsMissingValue(contentField) && !hasSchemaLocalizationDefault) {
        const fieldLabel = contentField.label || contentField.name || currentPath[currentPath.length - 1];
        errors = [{ message: `${fieldLabel ?? "Value"} is required` }];
      } else {
        errors = [];
      }
    } else {
      errors = checkType();
    }
    if (errors.length > 0) {
      return errors;
    }
    return validateConstraints(contentField, contentValue);
  }
  function localizationEntriesForLocale(localization, locale) {
    const lower = locale.toLowerCase();
    return Object.entries(localization).filter(([key]) => {
      const keyLower = key.toLowerCase();
      return keyLower === lower || keyLower.startsWith(`${lower}-`);
    }).map(([, entry]) => entry);
  }
  function hasLocalizationDefaultAtPath(defaultValue, subPath) {
    let cursor = defaultValue;
    for (const segment of subPath) {
      if (typeof cursor !== "object" || cursor === null || Array.isArray(cursor)) {
        return false;
      }
      cursor = cursor[segment];
    }
    return cursor !== void 0;
  }
  function allowsMissingValue(contentField) {
    if ("optional" in contentField && contentField.optional === true) {
      return true;
    }
    return contentField.type === "per_locale" && allowsMissingValue(contentField.childType);
  }
  function validateConstraints(contentNode, contentValue) {
    if ("constraints" in contentNode && contentNode["constraints"]) {
      return validate(contentNode["constraints"], contentValue, {});
    }
    return [];
  }
  function addToPath(fieldName, results) {
    return results.map((x) => ({ ...x, path: [fieldName, ...x.path ?? []] }));
  }

  // content-validator.ts
  function validate2(typeName, content) {
    return validateTypeByName(content_schema_default, typeName, content, { strict: true });
  }
  return __toCommonJS(content_validator_exports);
})();
function validate(...args) { return contentValidator.validate(...args); }