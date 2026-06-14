import torch
import torch.nn as nn
import torchvision.models as tv_models

class RiceEfficientNetB3(nn.Module):

    def __init__(self, num_classes):
        super().__init__()

        backbone = tv_models.efficientnet_b3(
            weights=None
        )

        self.features = backbone.features
        self.avgpool = backbone.avgpool

        feature_dim = backbone.classifier[1].in_features

        self.classifier = nn.Sequential(
            nn.BatchNorm1d(feature_dim),
            nn.Dropout(0.35),

            nn.Linear(feature_dim, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(0.40),

            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.30),

            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        return self.classifier(x)