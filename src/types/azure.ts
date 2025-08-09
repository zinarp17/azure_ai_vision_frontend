export type BoundingBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CaptionResult = {
  text: string;
  confidence: number;
};

export type DenseCaption = {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
};

export type Tag = {
  name: string;
  confidence: number;
};

export type DetectedObject = {
  boundingBox: BoundingBox;
  tags: Tag[];
};

export type SmartCrop = {
  aspectRatio: number;
  boundingBox: BoundingBox;
};

export type PersonDetection = {
  boundingBox: BoundingBox;
  confidence: number;
};

export type ImageMetadata = {
  width: number;
  height: number;
};

export type AnalyzeImageResponse = {
  modelVersion: string;
  captionResult?: CaptionResult;
  denseCaptionsResult?: { values: DenseCaption[] };
  metadata?: ImageMetadata;
  tagsResult?: { values: Tag[] };
  objectsResult?: { values: DetectedObject[] };
  readResult?: { blocks: unknown[] };
  smartCropsResult?: { values: SmartCrop[] };
  peopleResult?: { values: PersonDetection[] };
};


