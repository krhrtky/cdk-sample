import { resolve } from 'path';
import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

export class Ch11Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, 'LambdaHandler', {
      entry: resolve(__dirname, '../lambda/sample.ts'),
    });

    new cdk.CfnOutput(this, "Lambda", {
      value: lambda.functionName,
    });
  }
}