import Dependencies._
import Versions._


lazy val commonSettings: Seq[Def.Setting[_]] = Defaults.coreDefaultSettings ++ Seq(
  organization := "com.qiniu.pandora",
  version := "0.1.0-SNAPSHOT",
  scalaVersion := "2.10.6",
  resolvers ++= Dependencies.repos,
  credentials += Credentials(Path.userHome / ".sbt" / ".credentials"),
  dependencyOverrides += "org.scala-lang" % "scala-library" % scalaVersion.value,
  parallelExecution in Test := false,
  scalacOptions in ThisBuild ++= Seq("-unchecked", "-deprecation", "-feature"),
  // We need to exclude jms/jmxtools/etc because it causes undecipherable SBT errors  :(
  ivyXML :=
    <dependencies>
    <exclude module="jms"/>
    <exclude module="jmxtools"/>
    <exclude module="jmxri"/>
    </dependencies>
)

lazy val rootSettings = Seq(
  // Must run Spark tests sequentially because they compete for port 4040!
  parallelExecution in Test := false,

  // disable test for root project
  test := {}
)

lazy val root = (project in file("."))
  .settings(
    commonSettings,
    rootSettings,
    name := "sqladmin",
    libraryDependencies ++= sparkDeps ++ typeSafeConfigDeps ++ sparkExtraDeps ++ coreTestDeps
      ++ jobserverDeps,
    test in assembly := {},
    fork in Test := true
)
